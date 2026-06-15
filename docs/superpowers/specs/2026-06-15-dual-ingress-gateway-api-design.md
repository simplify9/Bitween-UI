# Dual ingress-nginx / Gateway API support for the Bitween chart

**Date:** 2026-06-15
**Status:** Approved (design)
**Chart:** `chart/` (`bitweenui`, v0.0.1)

## Problem

The Bitween UI Helm chart currently exposes the app via an `ingress-nginx`
`Ingress` resource. `ingress-nginx` has been deprecated upstream; the team has
moved internal infrastructure to the Gateway API (`HTTPRoute`), captured in the
reference chart `infrastructure-s9genericchart-v2` (read-only, not modified by
this work).

Because Bitween UI is an open-source project, we cannot simply drop
`ingress-nginx` and replace it with Gateway API. The chart must **support both**:

- **Default to `ingress-nginx`** — existing behavior is unchanged.
- **Contain and render the Gateway API element** (`HTTPRoute`) exactly as the
  reference chart, but **disabled by default**.
- When the operator opts into Gateway API at deploy time, the chart behaves like
  the reference Gateway API chart (HTTPRoute renders, Ingress does not).
- When Gateway API is not selected, **nothing** Gateway-API-related renders and
  the chart functions exactly as before.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Mode switch | `gateway.enabled` (default `false`) **auto-suppresses** the Ingress | Backward-compatible: `ingress.enabled` keeps its meaning; mirrors the reference chart's `gateway.enabled` flag; enabling gateway alone is enough to switch modes. |
| Gateway default values | Keep the reference `gateway:` block **verbatim** (except `enabled`) | Renders identically to the reference chart out of the box when enabled. |
| `service.yaml` port | Wire to `.Values.service.port` (default `80`) | Honors the new value consistently across Service and HTTPRoute; output stays byte-identical (still port 80). |

## Scope

The only Gateway API element is the `HTTPRoute`. The reference chart's other
resources (HPA, PDB, NetworkPolicy, ServiceAccount, ConfigMap, Secret,
NOTES.txt) are **out of scope** — they are not Gateway-API elements and are not
part of this change.

## Design

Additive and gated. The Ingress path stays byte-identical except for one extra
condition on its render guard. The Gateway API path is the reference chart's
`httproute.yaml` copied verbatim, plus the minimal values/helper it depends on,
shipped **off** by default. No new chart dependencies.

### 1. `templates/httproute.yaml` (new)

Copied **verbatim** from the reference chart
(`infrastructure-s9genericchart-v2/chart/templates/httproute.yaml`). Gated on
`{{- if .Values.gateway.enabled -}}`. Renders the `HTTPRoute`
(`apiVersion: gateway.networking.k8s.io/v1`) with:

- `parentRefs` (name / namespace / sectionName),
- optional `hostnames`,
- `rules` with path matches, optional per-route `timeouts`, and `backendRefs`.

Backend name defaults to `include "project.fullname" .`; backend port defaults
to `.Values.service.port`. Both resolve correctly against the local chart.

### 2. `templates/ingress.yaml` (one-line guard change)

```diff
- {{- if .Values.ingress.enabled -}}
+ {{- if and .Values.ingress.enabled (not .Values.gateway.enabled) -}}
```

Everything else in the template is unchanged.

### 3. `values.yaml` (additions only)

- Add the `gateway:` block **verbatim** from the reference chart, with the sole
  deviation `gateway.enabled: false` (required: the element must stay disabled by
  default). Verbatim defaults include `parentRefs` (`public-gateway`, namespace
  `s9-dev-edge`, sectionName `https-wildcard-sf9-io`), `hostnames`
  (`s9genericapp.sf9.io`), and the `routes` block with commented timeout
  examples.
- Add `service.port: 80` (the HTTPRoute backend default references
  `.Values.service.port`).

No existing values are removed or renamed.

### 4. `templates/_helpers.tpl` (add `project.labels`)

`httproute.yaml` calls `include "project.labels"`, which does not exist in the
local chart. Add it using the reference chart's modern `app.kubernetes.io/*`
label set, sourced from the **local** helpers:

```gotemplate
{{- define "project.labels" -}}
helm.sh/chart: {{ include "project.chart" . }}
app.kubernetes.io/name: {{ include "project.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
```

This is the one adaptation from the reference: the reference's
`default .Chart.AppVersion .Values.app.version` is reduced to `.Chart.AppVersion`
because the local chart has no `.Values.app`. Existing templates (`deployment`,
`service`, `ingress`) keep their current legacy labels untouched — only the
HTTPRoute uses `project.labels`.

### 5. `templates/service.yaml` (wire port)

```diff
   ports:
-    - port: 80
-      targetPort: 80
+    - port: {{ .Values.service.port | default 80 }}
+      targetPort: 80
```

`targetPort` stays at the container port `80`. With `service.port: 80` in
values, rendered output is byte-identical to today.

## Behavior matrix

| `gateway.enabled` | `ingress.enabled` | Renders |
|---|---|---|
| `false` (default) | `true` (default) | Ingress only — **identical to today** |
| `false` | `false` | Neither (as today) |
| `true` | `true` or `false` | HTTPRoute only, no Ingress |

## Verification

- `helm template` with defaults → identical Ingress output to the current chart,
  no `HTTPRoute`.
- `helm template --set gateway.enabled=true` → an `HTTPRoute` matching the
  reference chart's output, and **no** `Ingress`.
- `helm lint` passes in both modes.
- Diff the rendered `HTTPRoute` against the reference chart's rendered
  `HTTPRoute` (same inputs) to confirm structural parity.
