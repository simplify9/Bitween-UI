import { ArrayMapping, FieldMapping, FilterOperator } from 'src/components/MappingEditor/types';

/** Map of valuesSetId → (key → value) for enum lookups */
export type ValuesSetMap = Record<string, Record<string, string>>;

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

function renderFieldValue(mapping: FieldMapping, alias?: string, valuesSetMap?: ValuesSetMap): string {
  if (mapping.fixedValue !== undefined) {
    const num = Number(mapping.fixedValue);
    if (!isNaN(num) && mapping.fixedValue.trim() !== '') return String(num);
    if (mapping.fixedValue === 'true' || mapping.fixedValue === 'false') return mapping.fixedValue;
    return `"${mapping.fixedValue}"`;
  }
  const src = mapping.source;
  if (!src) return 'null';

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
    // values set not available locally — emit passthrough + annotation so parseScriban can restore
    return `{{ ${path} | json }}{{# enum:${mapping.valuesSetId} #}}`;
  }

  // transform expression — replace "value" with the actual path
  if (mapping.transform) {
    const path = alias ? `${alias}.${src.split('.').pop()}` : src.replace(/\./g, '.');
    return `{{ ${mapping.transform.replace(/\bvalue\b/g, path)} | json }}`;
  }

  // plain path
  const path = alias
    ? `${alias}.${src}` // within array context, src is already relative
    : src.replace(/\[?\*\]?/g, '');
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
 */
export function generateScriban(
  fieldMappings: FieldMapping[],
  arrayMappings: ArrayMapping[],
  valuesSetMap?: ValuesSetMap
): string {
  const rootLines: string[] = ['{'];

  // ── Simple field mappings ──────────────────────────────────────────────────
  const validFields = fieldMappings.filter(
    (m) => m.target.trim() && (m.source.trim() || m.fixedValue !== undefined)
  );

  for (const m of validFields) {
    rootLines.push(`  "${m.target}": ${renderFieldValue(m, undefined, valuesSetMap)},`);
  }

  // ── Array mappings ────────────────────────────────────────────────────────
  for (const am of arrayMappings) {
    if (!am.source || !am.target) continue;
    const alias = am.alias || 'item';
    const filterExpr = renderFilter(alias, am.filter ?? undefined);

    const innerLines: string[] = [];
    if (am.filter) {
      innerLines.push(`  {{- if ${filterExpr} -}}`);
    }
    innerLines.push('  {');
    for (const m of am.mappings) {
      if (!m.target.trim()) continue;
      innerLines.push(`    "${m.target}": ${renderFieldValue(m, alias, valuesSetMap)},`);
    }
    innerLines.push('  },');
    if (am.filter) {
      innerLines.push('  {{- end -}}');
    }

    rootLines.push(`  "${am.target}": [`);
    rootLines.push(`  {{- for ${alias} in ${am.source} -}}`);
    rootLines.push(...innerLines);
    rootLines.push('  {{- end -}}');
    rootLines.push('  ],');
  }

  rootLines.push('}');
  return rootLines.join('\n');
}

// ─── Parse Scriban back to mappings (best-effort) ──────────────────────────────

export type ParsedFieldMapping = Omit<FieldMapping, 'id'>;
export type ParsedArrayMapping = {
  source: string;
  target: string;
  alias: string;
  filter?: ArrayMapping['filter'];
  mappings: ParsedFieldMapping[];
};

export interface ParsedMappings {
  fieldMappings: ParsedFieldMapping[];
  arrayMappings: ParsedArrayMapping[];
  warnings: string[];
}

/** Strip `| json` suffix from a Scriban expression */
function stripJsonPipe(expr: string): string {
  return expr.replace(/\s*\|\s*json\s*$/, '').trim();
}

/** Parse a Scriban expression body into source/transform/valuesSetId */
function parseExpr(
  raw: string,
  valuesSetId: string | undefined,
  alias?: string,
): Pick<ParsedFieldMapping, 'source' | 'transform' | 'valuesSetId'> {
  const expr = stripJsonPipe(raw.trim());

  // Enum: $__e = { ... }; ($__e[path] ?? path)
  if (valuesSetId || expr.startsWith('$__e')) {
    const fallback = expr.match(/\?\?\s*([\w.]+)\s*\)/);
    const src = fallback ? fallback[1] : expr;
    const source = alias && src.startsWith(`${alias}.`) ? src.slice(alias.length + 1) : src;
    return { source, valuesSetId };
  }

  // Simple path — only word chars and dots
  if (/^[\w.]+$/.test(expr)) {
    const source = alias && expr.startsWith(`${alias}.`) ? expr.slice(alias.length + 1) : expr;
    return { source };
  }

  // Transform — convert alias.field references to `value`
  const transformExpr = alias
    ? expr.replace(new RegExp(`\\b${alias}\\.(\\w+)`, 'g'), 'value')
    : expr;
  const srcMatch = expr.match(/^([\w.]+)\s*[^\w.]/);
  const rawSrc = srcMatch ? srcMatch[1] : '';
  const source = alias && rawSrc.startsWith(`${alias}.`) ? rawSrc.slice(alias.length + 1) : rawSrc;
  return { source, transform: transformExpr };
}

export function parseScriban(template: string): ParsedMappings {
  const warnings: string[] = [];
  const fieldMappings: ParsedFieldMapping[] = [];
  const arrayMappings: ParsedArrayMapping[] = [];

  const lines = template.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // detect "for" loop block
    const forMatch = line.match(/\{\{-?\s*for\s+(\w+)\s+in\s+([\w.[\]*]+)\s*-?\}\}/);
    if (forMatch) {
      const alias = forMatch[1];
      const source = forMatch[2];
      let target = '';
      let filter: ArrayMapping['filter'] | undefined;
      const innerMappings: ParsedFieldMapping[] = [];

      // look for target array key just before the for line
      if (i > 0) {
        const prevLine = lines[i - 1].trim();
        const tMatch = prevLine.match(/"([\w.]+)"\s*:\s*\[/);
        if (tMatch) target = tMatch[1];
      }

      i++;
      while (i < lines.length) {
        const innerLine = lines[i].trim();
        if (innerLine.match(/\{\{-?\s*end\s*-?\}\}/)) { i++; break; }

        const ifMatch = innerLine.match(/\{\{-?\s*if\s+(\w+)\.([\w.]+)\s*([!=<>]+)\s*([^}]+)-?\}\}/);
        if (ifMatch) {
          filter = {
            field: ifMatch[2],
            operator: ifMatch[3].trim() as FilterOperator,
            value: ifMatch[4].trim().replace(/^"|"$/g, ''),
          };
          i++; continue;
        }

        const fieldMatch = innerLine.match(/"([\w.]+)"\s*:\s*(.*),?$/);
        if (fieldMatch) {
          const tgt = fieldMatch[1];
          const rawVal = fieldMatch[2].replace(/,$/, '').trim();
          const enumAnn = rawVal.match(/\{\{#\s*enum:([\w-]+)\s*#\}\}/);
          const innerValuesSetId = enumAnn ? enumAnn[1] : undefined;
          const cleanVal = rawVal.replace(/\{\{#\s*enum:[\w-]+\s*#\}\}/, '').trim();
          const exprMatch = cleanVal.match(/\{\{-?\s*([\s\S]+?)\s*-?\}\}/);
          if (exprMatch) {
            const parsed = parseExpr(exprMatch[1], innerValuesSetId, alias);
            innerMappings.push({ target: tgt, source: '', ...parsed });
          } else if (!cleanVal.includes('{{') && cleanVal !== 'null') {
            innerMappings.push({ source: '', target: tgt, fixedValue: cleanVal.replace(/^"|"$/g, '') });
          }
        }
        i++;
      }

      if (source && target) {
        arrayMappings.push({ source, target, alias, filter, mappings: innerMappings });
      } else {
        warnings.push(`Could not determine target array for "for ${alias} in ${source}"`);
      }
      continue;
    }

    // detect simple field mapping: "field": {{ path }} or "field": "value"
    const simpleMatch = line.match(/"([\w.]+)"\s*:\s*(.*),?$/);
    if (simpleMatch && !line.includes('{{- for') && !line.startsWith('[') && !line.startsWith(']')) {
      const target = simpleMatch[1];
      const valueRaw = simpleMatch[2].replace(/,$/, '').trim();

      // enum annotation: {{# enum:setId #}} anywhere on the line
      const enumAnnotation = valueRaw.match(/\{\{#\s*enum:([\w-]+)\s*#\}\}/);
      const valuesSetId = enumAnnotation ? enumAnnotation[1] : undefined;

      // strip the annotation before further parsing
      const valueClean = valueRaw.replace(/\{\{#\s*enum:[\w-]+\s*#\}\}/, '').trim();

      const exprMatch = valueClean.match(/\{\{-?\s*([\s\S]+?)\s*-?\}\}/);
      if (exprMatch) {
        const parsed = parseExpr(exprMatch[1], valuesSetId);
        fieldMappings.push({ target, source: '', ...parsed });
      } else if (!valueClean.includes('{{') && valueClean !== 'null') {
        fieldMappings.push({ source: '', target, fixedValue: valueClean.replace(/^"|"$/g, '') });
      } else if (valueClean.includes('{{')) {
        warnings.push(`Could not parse: ${line}`);
      }
    }

    i++;
  }

  return { fieldMappings, arrayMappings, warnings };
}
