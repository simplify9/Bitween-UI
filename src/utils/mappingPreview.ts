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
