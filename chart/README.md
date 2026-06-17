# bitweenui Helm chart

Deploys the Bitween UI as a Kubernetes `Deployment` + `Service`, exposed
north-south through either **ingress-nginx** (default) or the **Gateway API**
(`HTTPRoute`).

## Routing modes

The chart supports two mutually exclusive routing modes, selected at deploy time:

| Mode | How to select | Renders |
|------|---------------|---------|
| **ingress-nginx** (default) | nothing — this is the default | `Ingress` |
| **Gateway API** | `--set gateway.enabled=true` | `HTTPRoute` (and the `Ingress` is suppressed) |

`gateway.enabled` defaults to `false`, so out of the box the chart behaves
exactly as before: it renders only the `Ingress` and nothing Gateway-API-related.
Setting `gateway.enabled=true` flips routing to the Gateway API and automatically
suppresses the `Ingress` — you do **not** need to also set `ingress.enabled=false`.

### Behavior matrix

| `gateway.enabled` | `ingress.enabled` | Resources rendered |
|-------------------|-------------------|--------------------|
| `false` (default) | `true` (default)  | `Ingress` only     |
| `false`           | `false`           | neither            |
| `true`            | `true` or `false` | `HTTPRoute` only   |

## Usage

### ingress-nginx (default)

```sh
helm install bitween-ui ./chart \
  --set ingress.host=app.example.com
```

### Gateway API

```sh
helm install bitween-ui ./chart \
  --set gateway.enabled=true \
  --set gateway.hostnames[0]=app.example.com \
  --set gateway.parentRefs[0].name=public-gateway \
  --set gateway.parentRefs[0].namespace=my-gateway-ns \
  --set gateway.parentRefs[0].sectionName=https
```

The Gateway API requires the
[Gateway API CRDs](https://gateway-api.sigs.k8s.io/) and a Gateway controller
installed in the cluster, plus a `Gateway` for the `parentRefs` to attach to.

## Values

### Ingress (`ingress-nginx`)

| Key | Default | Description |
|-----|---------|-------------|
| `ingress.enabled` | `true` | Render an `Ingress` (only when `gateway.enabled` is `false`). |
| `ingress.annotations` | `{ kubernetes.io/ingress.class: nginx }` | Annotations applied to the `Ingress`. |
| `ingress.host` | _(unset)_ | Hostname for the ingress rule (and TLS host). |
| `ingress.tlsSecret` | `""` | TLS secret name. When set, adds a `tls` block for `ingress.host`. |

### Gateway API (`HTTPRoute`)

| Key | Default | Description |
|-----|---------|-------------|
| `gateway.enabled` | `false` | Render an `HTTPRoute` instead of the `Ingress`. |
| `gateway.parentRefs` | see `values.yaml` | `Gateway`/listener references the route attaches to (`name`, `namespace`, `sectionName`). |
| `gateway.hostnames` | see `values.yaml` | Hostnames the route matches. |
| `gateway.routes` | `[{ path: "/", pathType: PathPrefix }]` | Path matches and backend refs. Each entry supports `path`, `pathType`, optional `timeout.{request,backendRequest}`, and `backendRef.{name,port,namespace,weight}`. `backendRef.name` defaults to the release fullname; `backendRef.port` defaults to `service.port`. |

> The shipped `gateway` defaults reference Simplify9 cluster infrastructure
> (`public-gateway` / `s9-dev-edge` / `*.sf9.io`). Override `parentRefs` and
> `hostnames` for your own Gateway and domain.

### Common

| Key | Default | Description |
|-----|---------|-------------|
| `replicaCount` | `1` | Number of pod replicas. |
| `image.repo` | `docker.io/simplify9` | Image repository prefix; the image is `<repo>/<chart-name>:<chart-version>`. |
| `probes.enabled` | `false` | Enable liveness/readiness probes on `/`. |
| `service.port` | `80` | Service port (also the default `HTTPRoute` backend port). |
