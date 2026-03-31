import { ArrayMapping, FieldMapping, FilterOperator } from 'src/state/stateSlices/mappingEditor';

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

function renderFieldValue(mapping: FieldMapping, alias?: string): string {
  if (mapping.fixedValue !== undefined) {
    const num = Number(mapping.fixedValue);
    if (!isNaN(num) && mapping.fixedValue.trim() !== '') return String(num);
    if (mapping.fixedValue === 'true' || mapping.fixedValue === 'false') return mapping.fixedValue;
    return `"${mapping.fixedValue}"`;
  }
  const src = mapping.source;
  if (!src) return 'null';

  // transform expression — replace "value" with the actual path
  if (mapping.transform) {
    const path = alias ? `${alias}.${src.split('.').pop()}` : src.replace(/\./g, '.');
    return `{{ ${mapping.transform.replace(/\bvalue\b/g, path)} }}`;
  }

  // plain path
  const path = alias
    ? `${alias}.${src}` // within array context, src is already relative
    : src.replace(/\[?\*\]?/g, '');
  return `{{ ${path} }}`;
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
 */
export function generateScriban(
  fieldMappings: FieldMapping[],
  arrayMappings: ArrayMapping[]
): string {
  const rootLines: string[] = ['{'];

  // ── Simple field mappings ──────────────────────────────────────────────────
  const validFields = fieldMappings.filter(
    (m) => m.target.trim() && (m.source.trim() || m.fixedValue !== undefined)
  );

  for (const m of validFields) {
    rootLines.push(`  "${m.target}": ${renderFieldValue(m)},`);
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
      innerLines.push(`    "${m.target}": ${renderFieldValue(m, alias)},`);
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

        const fieldMatch = innerLine.match(/"([\w.]+)"\s*:\s*\{\{\s*([\w.]+)\s*\}\}/);
        if (fieldMatch) {
          const tgt = fieldMatch[1];
          const src = fieldMatch[2].startsWith(`${alias}.`)
            ? fieldMatch[2].slice(alias.length + 1)
            : fieldMatch[2];
          innerMappings.push({ source: src, target: tgt });
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
      const dynMatch = valueRaw.match(/\{\{[- ]*([\w. *]+)[- ]*\}\}/);
      if (dynMatch) {
        fieldMappings.push({ source: dynMatch[1].trim(), target });
      } else if (!valueRaw.includes('{{')) {
        // fixed value
        const fixed = valueRaw.replace(/^"|"$/g, '');
        fieldMappings.push({ source: '', target, fixedValue: fixed });
      } else {
        warnings.push(`Could not parse: ${line}`);
      }
    }

    i++;
  }

  return { fieldMappings, arrayMappings, warnings };
}
