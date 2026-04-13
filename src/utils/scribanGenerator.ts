import { ArrayMapping, FieldMapping, FilterOperator, LookupDictionary, LookupEntry } from 'src/components/MappingEditor/types';

/** Map of valuesSetId → (key → value) for enum lookups */
export type ValuesSetMap = Record<string, Record<string, string>>;

/** Map of dot-path → primitive type inferred from a JSON sample */
export type TypeMap = Record<string, 'string' | 'number' | 'boolean'>;

/**
 * Build a TypeMap by walking every leaf in a JSON sample.
 * Array items are represented with [*] in the path, e.g. "orders[*].price".
 */
export function buildTypeMap(json: string): TypeMap {
  try {
    return walkTypeMap(JSON.parse(json), '');
  } catch {
    return {};
  }
}

function walkTypeMap(node: any, prefix: string): TypeMap {
  if (node === null || node === undefined) return {};
  if (Array.isArray(node)) {
    if (node.length === 0 || typeof node[0] !== 'object') return {};
    return walkTypeMap(node[0], prefix); // use first element as representative
  }
  if (typeof node === 'object') {
    const result: TypeMap = {};
    for (const [k, v] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (Array.isArray(v)) {
        // descend into array items using [*] notation
        const inner = walkTypeMap(v, `${path}[*]`);
        Object.assign(result, inner);
      } else if (v !== null && typeof v === 'object') {
        Object.assign(result, walkTypeMap(v, path));
      } else if (typeof v === 'string') {
        result[path] = 'string';
      } else if (typeof v === 'number') {
        result[path] = 'number';
      } else if (typeof v === 'boolean') {
        result[path] = 'boolean';
      }
    }
    return result;
  }
  return {};
}

/**
 * Return a Scriban-safe inline cast expression when source and target types differ.
 * to_float is registered as a custom function in ScribanJsonHelper.cs.
 */
function castExpr(path: string, targetType: 'string' | 'number' | 'boolean'): string {
  if (targetType === 'number') return `(${path} | to_float)`;
  if (targetType === 'boolean') return `(${path} != null && ${path} != '' && ${path} != 'false' && ${path} != '0')`;
  // string: concatenate with "" to force coercion of any type (number/bool → string)
  return `("" + ${path})`;
}

// ─── Scriban template generator ───────────────────────────────────────────────

const OPERATOR_MAP: Record<FilterOperator, string> = {
  '==': '==',
  '!=': '!=',
  '>': '>',
  '>=': '>=',
  '<': '<',
  '<=': '<=',
};

function renderFilter(alias: string, filter: ArrayMapping['filter']): string {
  if (!filter) return '';
  const op = OPERATOR_MAP[filter.operator] ?? filter.operator;
  const val = typeof filter.value === 'number' ? filter.value : `"${filter.value}"`;
  return `${alias}.${filter.field} ${op} ${val}`;
}

function renderFieldValue(
  mapping: FieldMapping,
  alias?: string,
  valuesSetMap?: ValuesSetMap,
  targetType?: 'string' | 'number' | 'boolean'
): string {
  if (mapping.fixedValue !== undefined) {
    const num = Number(mapping.fixedValue);
    if (!isNaN(num) && mapping.fixedValue.trim() !== '') return String(num);
    if (mapping.fixedValue === 'true' || mapping.fixedValue === 'false') return mapping.fixedValue;
    return `"${mapping.fixedValue}"`;
  }
  const src = mapping.source;
  if (!src) return 'null';

  // inline dictionary lookup — user-defined key→value map (takes precedence over valuesSetId)
  if (mapping.lookupDictionary?.entries && mapping.lookupDictionary.entries.length > 0) {
    const path = alias ? `${alias}.${src}` : src.replace(/\[?\*\]?/g, '');

    // Format a single output value with the correct type for the Scriban dict literal
    const fmtVal = (v: string): string => {
      if (targetType === 'number') {
        const n = Number(v);
        return isNaN(n) ? `"${v}"` : String(n);
      }
      if (targetType === 'boolean') {
        return v === 'true' || v === '1' ? 'true' : 'false';
      }
      return `"${v}"`; // string (default)
    };

    const entries = mapping.lookupDictionary.entries
      .filter(({ from, to }) => from.trim() !== '' && to.trim() !== '')
      .map(({ from, to }) => `"${from}": ${fmtVal(to)}`)
      .join(', ');
    if (!entries) return `{{ ${path} | json }}`;
    const lkp = mapping.lookupDictionary;
    if (lkp.fallback === 'null') {
      return `{{ $__e = { ${entries} }; $__e[${path}] | json }}`;
    }
    const fb = lkp.fallback === 'custom'
      ? fmtVal(lkp.fallbackValue ?? '')
      : path; // passthrough — keep original value
    return `{{ $__e = { ${entries} }; ($__e[${path}] ?? ${fb}) | json }}`;
  }

  // enum / values-set lookup — bake the dictionary inline
  if (mapping.valuesSetId) {
    const path = alias
      ? `${alias}.${src}`
      : src.replace(/\[?\*\]?/g, '');
    const dict = valuesSetMap?.[mapping.valuesSetId];
    if (dict && Object.keys(dict).length > 0) {
      const entries = Object.entries(dict)
        .map(([k, v]) => `"${k}": "${v}"`)
        .join(', ');
      return `{{ $__e = { ${entries} }; ($__e[${path}] ?? ${path}) | json }}{{# enum:${mapping.valuesSetId} #}}`;
    }
    return `{{ ${path} | json }}{{# enum:${mapping.valuesSetId} #}}`;
  }

  // transform expression — replace "value" with the actual path
  if (mapping.transform) {
    const path = alias ? `${alias}.${src.split('.').pop()}` : src.replace(/\./g, '.');
    return `{{ ${mapping.transform.replace(/\bvalue\b/g, path)} | json }}`;
  }

  // plain path — apply type cast when target type is known
  const path = alias
    ? `${alias}.${src}`
    : src.replace(/\[?\*\]?/g, '');

  if (targetType) {
    return `{{ ${castExpr(path, targetType)} | json }}`;
  }
  return `{{ ${path} | json }}`;
}

function indent(lines: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return lines
    .split('\n')
    .map((l) => pad + l)
    .join('\n');
}

/**
 * Generate a Scriban template from field + array mappings.
 * Pass valuesSetMap to bake enum dictionaries inline; omit for degraded passthrough.
 * Pass outputJson to enable automatic type-cast filters when source/target types differ.
 */
export function generateScriban(
  fieldMappings: FieldMapping[],
  arrayMappings: ArrayMapping[],
  valuesSetMap?: ValuesSetMap,
  outputJson?: string,
  inputJson?: string
): string {
  const typeMap: TypeMap = outputJson ? buildTypeMap(outputJson) : {};
  const rootLines: string[] = ['{'];

  // ── Simple field mappings ──────────────────────────────────────────────────
  const validFields = fieldMappings.filter(
    (m) => m.target.trim() && (m.source.trim() || m.fixedValue !== undefined)
  );

  for (const m of validFields) {
    const targetType = typeMap[m.target];
    rootLines.push(`  "${m.target}": ${renderFieldValue(m, undefined, valuesSetMap, targetType)},`);
  }

  // ── Array mappings (top-level only; children are rendered recursively inside parent loops) ─
  for (const am of arrayMappings.filter((am) => !am.parentArrayId)) {
    if (!am.target) continue;
    rootLines.push(...renderArrayMapping(am, arrayMappings, undefined, 0, valuesSetMap, typeMap, inputJson));
  }

  rootLines.push('}');
  return rootLines.join('\n');
}

/** Recursively embed child AMs' fixedItems — skip keys already present inline. */
function enrichFixedItem(
  item: Record<string, unknown>,
  am: ArrayMapping,
  allAMs: ArrayMapping[]
): Record<string, unknown> {
  const children = allAMs.filter((c) => c.parentArrayId === am.id && c.fixedItems?.length && c.target);
  if (children.length === 0) return item;
  const enriched: Record<string, unknown> = { ...item };
  for (const child of children) {
    if (!(child.target in enriched)) {
      enriched[child.target] = child.fixedItems!.map((fi) =>
        enrichFixedItem(fi as Record<string, unknown>, child, allAMs)
      );
    }
  }
  return enriched;
}

/** Recursively check whether any value in a tree contains a {{dynamic}} reference. */
function hasDynamicDeep(v: unknown): boolean {
  if (typeof v === 'string') return /^\{\{.+\}\}$/.test(v);
  if (Array.isArray(v)) return v.some(hasDynamicDeep);
  if (v && typeof v === 'object') return Object.values(v as object).some(hasDynamicDeep);
  return false;
}

/** Coerce a fixed value to the target type for JSON emission. */
function coerceFixedValue(v: unknown, targetType: 'string' | 'number' | 'boolean' | undefined): unknown {
  if (targetType === 'number') {
    const n = Number(v);
    return isNaN(n) ? v : n;
  }
  if (targetType === 'boolean') {
    if (v === true || v === 'true') return true;
    if (v === false || v === 'false') return false;
    return v;
  }
  if (targetType === 'string') {
    return String(v);
  }
  return v; // unknown target type — keep as-is
}

/** Recursively emit a fixed-item value as Scriban-safe line(s), expanding {{expr}} references. */
function emitFixedValueLines(v: unknown, pad: string, typeMap?: TypeMap, fieldPath?: string): string[] {
  if (Array.isArray(v)) {
    if (!v.some(hasDynamicDeep)) return [JSON.stringify(v)];
    const subPad = pad + '  ';
    const result: string[] = ['['];
    for (const item of v) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        result.push(`${subPad}{`);
        const kPad = subPad + '  ';
        for (const [k, sv] of Object.entries(item as Record<string, unknown>)) {
          const childPath = fieldPath ? `${fieldPath}.${k}` : k;
          const vLines = emitFixedValueLines(sv, kPad, typeMap, childPath);
          result.push(`${kPad}"${k}": ${vLines[0]}${vLines.length === 1 ? ',' : ''}`);
          for (let li = 1; li < vLines.length - 1; li++) result.push(vLines[li]);
          if (vLines.length > 1) result.push(`${vLines[vLines.length - 1]},`);
        }
        result.push(`${subPad}},`);
      } else {
        const vLines = emitFixedValueLines(item, subPad, typeMap, fieldPath);
        result.push(`${subPad}${vLines.join('\n')},`);
      }
    }
    result.push(`${pad}]`);
    return result;
  }
  if (typeof v === 'string') {
    const m = v.match(/^\{\{(.+)\}\}$/);
    if (m) {
      const expr = m[1].trim();
      const targetType = fieldPath ? typeMap?.[fieldPath] : undefined;
      return targetType
        ? [`{{ ${castExpr(expr, targetType)} | json }}`]
        : [`{{ ${expr} | json }}`];
    }
    const targetType = fieldPath ? typeMap?.[fieldPath] : undefined;
    return [JSON.stringify(coerceFixedValue(v, targetType))];
  }
  // Non-string primitives (number, boolean) — apply target type coercion if known
  const primitiveTargetType = fieldPath ? typeMap?.[fieldPath] : undefined;
  if (primitiveTargetType !== undefined) return [JSON.stringify(coerceFixedValue(v, primitiveTargetType))];
  return [JSON.stringify(v)];
}

/**
 * Recursively render a single ArrayMapping block (and its children) at a given nesting depth.
 * depth=0 → 2-space indent (root-level); depth=1 → 4-space indent (inside a loop), etc.
 */
function renderArrayMapping(
  am: ArrayMapping,
  allAMs: ArrayMapping[],
  outerAlias: string | undefined,
  depth: number,
  valuesSetMap?: ValuesSetMap,
  typeMap?: TypeMap,
  inputJson?: string
): string[] {
  const pad = ' '.repeat(2 * (depth + 1));
  const fieldPad = ' '.repeat(2 * (depth + 2));
  const alias = am.alias || 'item';
  const source = outerAlias ? `${outerAlias}.${am.source}` : am.source;
  const filterExpr = renderFilter(alias, am.filter ?? undefined);

  // Build the full item prefix for typeMap lookups, e.g. "labels[*]" or "orders[*].items[*]"
  function resolvePrefix(id: string): string {
    const m = allAMs.find((a) => a.id === id);
    if (!m) return '';
    if (!m.parentArrayId) return `${m.target}[*]`;
    return `${resolvePrefix(m.parentArrayId)}.${m.target}[*]`;
  }
  const itemPrefix = resolvePrefix(am.id);

  // Build a set of ALL dot-paths that exist within an array item — used as fallback
  // for old mappings that predate the isRootSource flag.
  const itemPathSet = new Set<string>();
  if (inputJson && am.source) {
    try {
      const root = JSON.parse(inputJson);
      const buildFullSrcPath = (id: string): string => {
        const a = allAMs.find((x) => x.id === id);
        if (!a) return '';
        if (!a.parentArrayId) return a.source;
        return `${buildFullSrcPath(a.parentArrayId)}.${a.source}`;
      };
      let node: any = root;
      for (const part of buildFullSrcPath(am.id).split('.')) {
        if (node == null) break;
        if (Array.isArray(node)) node = node[0];
        if (typeof node !== 'object' || node == null) break;
        node = node[part];
      }
      if (Array.isArray(node) && node.length > 0 && node[0] && typeof node[0] === 'object') {
        const collectPaths = (obj: any, prefix: string) => {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { if (prefix) itemPathSet.add(prefix); return; }
          for (const [k, v] of Object.entries(obj)) {
            const p = prefix ? `${prefix}.${k}` : k;
            itemPathSet.add(p);
            collectPaths(v, p);
          }
        };
        collectPaths(node[0], '');
      }
    } catch { /* ignore */ }
  }

  const lines: string[] = [];
  lines.push(`${pad}"${am.target}": [`);
  if (am.fixedItems?.length) {
    for (const rawItem of am.fixedItems) {
      const enriched = enrichFixedItem(rawItem as Record<string, unknown>, am, allAMs);
      if (!hasDynamicDeep(enriched)) {
        // Coerce each top-level field to the correct target type
        const coerced: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(enriched)) {
          const targetType = typeMap?.[`${itemPrefix}.${k}`];
          coerced[k] = targetType !== undefined ? coerceFixedValue(v, targetType) : v;
        }
        lines.push(`${pad}${JSON.stringify(coerced)},`);
      } else {
        lines.push(`${pad}{`);
        for (const [k, v] of Object.entries(enriched)) {
          const fieldPath = `${itemPrefix}.${k}`;
          const vLines = emitFixedValueLines(v, fieldPad, typeMap, fieldPath);
          lines.push(`${fieldPad}"${k}": ${vLines[0]}${vLines.length === 1 ? ',' : ''}`);
          for (let li = 1; li < vLines.length - 1; li++) lines.push(vLines[li]);
          if (vLines.length > 1) lines.push(`${vLines[vLines.length - 1]},`);
        }
        lines.push(`${pad}},`);
      }
    }
  }
  if (!am.source) {
    // Fixed-items-only array — no loop needed
    lines.push(`${pad}],`);
    return lines;
  }
  lines.push(`${pad}{{- for ${alias} in ${source} -}}`);
  if (am.filter) {
    lines.push(`${pad}{{- if ${filterExpr} -}}`);
  }
  lines.push(`${pad}{`);
  for (const m of am.mappings) {
    if (!m.target.trim()) continue;
    const targetType = typeMap?.[`${itemPrefix}.${m.target}`];
    // isRootSource is set explicitly by the modal when user picks from root fields group.
    // For old mappings without the flag, fall back to checking itemPathSet from inputJson:
    // if the source is not a known item path, it must be a root field.
    const isRoot = m.isRootSource === true ||
      (m.isRootSource === undefined && itemPathSet.size > 0 && Boolean(m.source) && !itemPathSet.has(m.source));
    lines.push(`${fieldPad}"${m.target}": ${renderFieldValue(m, isRoot ? undefined : alias, valuesSetMap, targetType)},`);
  }
  // Render child AMs recursively inside this loop body
  const children = allAMs.filter((c) => c.parentArrayId === am.id && c.source && c.target);
  for (const child of children) {
    lines.push(...renderArrayMapping(child, allAMs, alias, depth + 1, valuesSetMap, typeMap, inputJson));
  }
  lines.push(`${pad}},`);
  if (am.filter) {
    lines.push(`${pad}{{- end -}}`);
  }
  lines.push(`${pad}{{- end -}}`);
  lines.push(`${pad}],`);
  return lines;
}

// ─── Re-exported from scribanParser.ts ───────────────────────────────────────

export type { ParsedFieldMapping, ParsedArrayMapping, ParsedMappings } from './scribanParser';
export { resolveParentArrayIds, parseScriban } from './scribanParser';









