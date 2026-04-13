import { ArrayMapping } from './types';
import { TreeNode } from 'src/utils/mappingPreview';

// ─── Helper: resolve full target prefix for a nested ArrayMapping ─────────────

export function getFullTargetPrefix(amId: string, allMappings: ArrayMapping[]): string {
  const am = allMappings.find((m) => m.id === amId);
  if (!am) return '';
  if (!am.parentArrayId) return am.target;
  return `${getFullTargetPrefix(am.parentArrayId, allMappings)}[*].${am.target}`;
}

// ─── Helper: build tree from flat target paths ────────────────────────────────

export function buildMappingTree(targetPaths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of targetPaths) {
    const parts = path.split('.');
    insertNode(root, parts, 0, '');
  }

  return root;
}

export function insertNode(
  nodes: TreeNode[],
  parts: string[],
  depth: number,
  parentPath: string
): void {
  if (parts.length === 0) return;
  const rawPart = parts[0];
  const isArray = rawPart.includes('[*]') || rawPart.includes('[]');
  const key = rawPart.replace(/\[\*\]|\[\]/g, '');
  const currentPath = parentPath ? `${parentPath}.${rawPart}` : rawPart;

  let existing = nodes.find((n) => n.key === key);
  if (parts.length === 1) {
    if (!existing) {
      nodes.push({ key, path: currentPath, type: 'leaf', children: [] });
    }
    return;
  }

  if (!existing) {
    existing = { key, path: currentPath, type: isArray ? 'array' : 'object', children: [] };
    nodes.push(existing);
  }
  insertNode(existing.children, parts.slice(1), depth + 1, currentPath);
}
