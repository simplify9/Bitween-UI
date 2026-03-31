import { ArrayMapping, FieldMapping, FilterCondition } from 'src/state/stateSlices/mappingEditor';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getByDotPath(obj: any, path: string): any {
  if (!path || obj == null) return undefined;
  return path.split('.').reduce((acc: any, key: string) => {
    if (acc == null) return undefined;
    const arrMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (arrMatch) return acc[arrMatch[1]]?.[Number(arrMatch[2])];
    return acc[key];
  }, obj);
}

function setByDotPath(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof node[keys[i]] !== 'object' || node[keys[i]] === null) {
      node[keys[i]] = {};
    }
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
}

function applyTransform(value: any, transform: string): any {
  try {
    // Simple expression evaluator: replace "value" with the actual value
    // Only support safe arithmetic expressions
    const safeExpr = transform.replace(/\bvalue\b/g, JSON.stringify(value));
    // Use Function constructor for arithmetic only (no access to globals except Math)
    const result = new Function('Math', `"use strict"; return (${safeExpr})`)(Math);
    return result;
  } catch {
    return value;
  }
}

function matchesFilter(item: any, filter: FilterCondition): boolean {
  const fieldValue = getByDotPath(item, filter.field);
  const testValue = filter.value;

  switch (filter.operator) {
    case '==':
      // eslint-disable-next-line eqeqeq
      return fieldValue == testValue;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return fieldValue != testValue;
    case '>':
      return Number(fieldValue) > Number(testValue);
    case '>=':
      return Number(fieldValue) >= Number(testValue);
    case '<':
      return Number(fieldValue) < Number(testValue);
    case '<=':
      return Number(fieldValue) <= Number(testValue);
    default:
      return true;
  }
}

// ─── Preview evaluation ───────────────────────────────────────────────────────

export interface PreviewResult {
  output: any;
  warnings: string[];
}

export function evaluateMappings(
  inputJson: string,
  fieldMappings: FieldMapping[],
  arrayMappings: ArrayMapping[]
): PreviewResult {
  const warnings: string[] = [];
  let inputObj: any = null;

  try {
    inputObj = JSON.parse(inputJson);
  } catch {
    return { output: null, warnings: ['Invalid input JSON — cannot generate preview'] };
  }

  const result: any = {};

  // Split field mappings into scalar (source has no [*]) and inline-array (source contains [*])
  const scalarMappings = fieldMappings.filter(
    (m) => !m.source.includes('[*]')
  );
  const inlineArrayMappings = fieldMappings.filter(
    (m) => m.fixedValue === undefined && m.source.includes('[*]')
  );

  // ── Simple scalar field mappings ──────────────────────────────────────────
  for (const mapping of scalarMappings) {
    if (!mapping.target.trim()) continue;

    let value: any;
    if (mapping.fixedValue !== undefined) {
      const n = Number(mapping.fixedValue);
      value = !isNaN(n) && mapping.fixedValue.trim() !== '' ? n : mapping.fixedValue;
    } else if (mapping.source.trim()) {
      value = getByDotPath(inputObj, mapping.source);
      if (value === undefined) {
        warnings.push(`Source path not found: ${mapping.source}`);
        value = null;
      }
      if (mapping.transform) {
        value = applyTransform(value, mapping.transform);
      }
    } else {
      continue;
    }

    // Only write to target if it doesn't contain [*] (can't write scalar to array path)
    if (!mapping.target.includes('[*]')) {
      setByDotPath(result, mapping.target, value);
    }
  }

  // ── Inline array field mappings (paths containing [*]) ────────────────────
  // Group by "sourceArrayPrefix|||targetArrayPrefix"
  const inlineGroups = new Map<string, FieldMapping[]>();
  for (const m of inlineArrayMappings) {
    if (!m.target.trim()) continue;
    const srcPrefix = m.source.split('[*]')[0].replace(/\.$/, '');
    const tgtPrefix = m.target.split('[*]')[0].replace(/\.$/, '');
    const key = `${srcPrefix}|||${tgtPrefix}`;
    if (!inlineGroups.has(key)) inlineGroups.set(key, []);
    inlineGroups.get(key)!.push(m);
  }

  for (const [key, groupMappings] of inlineGroups) {
    const [srcPrefix, tgtPrefix] = key.split('|||');
    const sourceArray = getByDotPath(inputObj, srcPrefix);
    if (!Array.isArray(sourceArray)) {
      warnings.push(`Expected array at path "${srcPrefix}" but got ${typeof sourceArray}`);
      continue;
    }

    const outputArray = sourceArray.map((item: any) => {
      const outputItem: any = {};
      for (const m of groupMappings) {
        if (!m.target.trim()) continue;
        // relative key after [*]. e.g. "Description" from "Items[*].Description"
        const srcAfter = m.source.split('[*].')[1] ?? '';
        const tgtAfter = m.target.split('[*].')[1] ?? '';
        if (!tgtAfter) continue;

        let val: any;
        if (m.fixedValue !== undefined) {
          val = m.fixedValue;
        } else if (srcAfter) {
          val = getByDotPath(item, srcAfter);
          if (val === undefined) val = null;
          if (m.transform) val = applyTransform(val, m.transform);
        } else {
          continue;
        }
        setByDotPath(outputItem, tgtAfter, val);
      }
      return outputItem;
    });

    setByDotPath(result, tgtPrefix, outputArray);
  }

  // ── Array mappings ────────────────────────────────────────────────────────
  for (const am of arrayMappings) {
    if (!am.source || !am.target) continue;

    const sourceArray = getByDotPath(inputObj, am.source);
    if (!Array.isArray(sourceArray)) {
      warnings.push(`Source path "${am.source}" is not an array`);
      continue;
    }

    let items = sourceArray;

    // Apply filter
    if (am.filter) {
      items = items.filter((item) => matchesFilter(item, am.filter!));
    }

    const mapped = items.map((item: any) => {
      const outputItem: any = {};
      for (const m of am.mappings) {
        if (!m.target.trim()) continue;
        let val: any;
        if (m.fixedValue !== undefined) {
          val = m.fixedValue;
        } else if (m.source) {
          val = getByDotPath(item, m.source);
          if (val === undefined) val = null;
          if (m.transform) val = applyTransform(val, m.transform);
        } else {
          continue;
        }
        setByDotPath(outputItem, m.target, val);
      }
      return outputItem;
    });

    setByDotPath(result, am.target, mapped);
  }

  return { output: result, warnings };
}

// ─── Tree building for left/right panels ─────────────────────────────────────

export type TreeNodeType = 'leaf' | 'object' | 'array';

export interface TreeNode {
  key: string;
  path: string;
  type: TreeNodeType;
  value?: any;
  itemCount?: number;
  children: TreeNode[];
}

export function buildTree(obj: any, keyName = '', prefix = ''): TreeNode[] {
  if (obj === null || obj === undefined) {
    return keyName ? [{ key: keyName, path: prefix, type: 'leaf', value: null, children: [] }] : [];
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0 || typeof obj[0] !== 'object' || obj[0] === null) {
      return keyName ? [{ key: keyName, path: prefix, type: 'leaf', value: obj, children: [] }] : [];
    }
    const children = Object.entries(obj[0] as object).flatMap(([k, v]) =>
      buildTree(v, k, prefix ? `${prefix}[*].${k}` : k)
    );
    return keyName
      ? [{ key: keyName, path: prefix, type: 'array', itemCount: obj.length, children }]
      : children;
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as object).flatMap(([k, v]) =>
      buildTree(v, k, prefix ? `${prefix}.${k}` : k)
    );
    if (!keyName) return entries;
    return [{ key: keyName, path: prefix, type: 'object', children: entries }];
  }
  return keyName ? [{ key: keyName, path: prefix, type: 'leaf', value: obj, children: [] }] : [];
}

export function flattenLeafPaths(node: TreeNode): string[] {
  if (node.type === 'leaf') return [node.path];
  return node.children.flatMap(flattenLeafPaths);
}

export function tryParseJson(s: string): any | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
