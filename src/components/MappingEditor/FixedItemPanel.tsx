import React, { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { TreeNode } from 'src/utils/mappingPreview';

// ─── Fixed-item inline panel types ───────────────────────────────────────────

export type DraftFieldMode = 'source' | 'fixed' | 'array';

export interface DraftField {
  key: string;
  mode: DraftFieldMode;
  value: string;
  transform: string;
  showTransform: boolean;
  // array mode only:
  nestedChildNode?: TreeNode;
  nestedItems?: DraftField[][];
  addingItem?: DraftField[] | null;
  editingSubIdx?: number | null;
}

export const FIXED_ITEM_MAX_DEPTH = 2; // 0-based: depths 0,1,2 → 3 nesting levels

export function initDraftFieldsFromNode(node: TreeNode | undefined): DraftField[] {
  if (!node) return [{ key: '', mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }];
  const leafKeys = node.children.filter((c) => c.type === 'leaf').map((c) => c.key);
  if (leafKeys.length > 0) {
    return leafKeys.map((key) => ({ key, mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }));
  }
  return [{ key: '', mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }];
}

export function draftFieldsToRecord(fields: DraftField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const df of fields) {
    const k = df.key.trim();
    if (!k) continue;
    if (df.mode === 'array') {
      result[k] = (df.nestedItems ?? []).map((itemFields) => draftFieldsToRecord(itemFields));
    } else if (df.mode === 'source') {
      if (!df.value.trim()) continue;
      const expr = df.transform.trim()
        ? df.transform.trim().replace(/\bvalue\b/g, df.value.trim())
        : df.value.trim();
      result[k] = `{{${expr}}}`;
    } else {
      if (df.value.trim() === '') continue;
      const raw = df.value.trim();
      const n = Number(raw);
      if (raw !== '' && !isNaN(n)) result[k] = n;
      else if (raw === 'true') result[k] = true;
      else if (raw === 'false') result[k] = false;
      else result[k] = raw;
    }
  }
  return result;
}

export function recordToDraftFields(item: Record<string, unknown>, node: TreeNode): DraftField[] {
  const leafKeys = node.children.filter((c) => c.type === 'leaf').map((c) => c.key);
  const arrayChildren = node.children.filter((c) => c.type === 'array');
  const allKeys = [...new Set([...leafKeys, ...Object.keys(item)])];
  return allKeys.map((key): DraftField => {
    const v = item[key];
    if (Array.isArray(v)) {
      const childNode = arrayChildren.find((c) => c.key === key);
      return {
        key, mode: 'array', value: '', transform: '', showTransform: false,
        nestedChildNode: childNode,
        nestedItems: v.map((subItem) =>
          childNode
            ? recordToDraftFields(subItem as Record<string, unknown>, childNode)
            : Object.entries(subItem as Record<string, unknown>).map(([k, sv]) => ({
                key: k, mode: 'fixed' as DraftFieldMode, value: String(sv ?? ''), transform: '', showTransform: false,
              }))
        ),
        addingItem: null,
      };
    }
    if (typeof v === 'string') {
      const m = v.match(/^\{\{(.+)\}\}$/);
      if (m) return { key, mode: 'source', value: m[1].trim(), transform: '', showTransform: false };
    }
    return { key, mode: 'fixed', value: v !== undefined ? String(v) : '', transform: '', showTransform: false };
  });
}

// ─── FixedItemFieldRows — recursive form for one fixed item's fields ──────────

export interface FixedItemFieldRowsProps {
  fields: DraftField[];
  onFieldsChange: (fields: DraftField[]) => void;
  parentNode: TreeNode;
  depth: number;
  inputScalarProps: string[];
  idPrefix: string;
}

export const FixedItemFieldRows: React.FC<FixedItemFieldRowsProps> = ({
  fields, onFieldsChange, parentNode, depth, inputScalarProps, idPrefix,
}) => {
  const hasFreeKey = parentNode.children.filter((c) => c.type === 'leaf').length === 0;
  const childArrayNodes = parentNode.children.filter((c) => c.type === 'array');
  const usedArrayKeys = new Set(fields.filter((f) => f.mode === 'array').map((f) => f.key));
  const availableArrayNodes = depth < FIXED_ITEM_MAX_DEPTH
    ? childArrayNodes.filter((c) => !usedArrayKeys.has(c.key))
    : [];
  const updateField = (i: number, patch: Partial<DraftField>) =>
    onFieldsChange(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <div className="space-y-1">
      {fields.map((df, i) => {
        if (df.mode === 'array') {
          return (
            <div key={`${df.key}-arr-${i}`} className="rounded border border-indigo-200 bg-indigo-50/40 p-1.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-indigo-700 font-mono">{df.key}[]</span>
                <button className="text-gray-300 hover:text-rose-500 transition"
                  onClick={() => onFieldsChange(fields.filter((_, j) => j !== i))}>
                  <HiOutlineTrash size={11} />
                </button>
              </div>
              {/* committed sub-items */}
              {(df.nestedItems ?? []).map((itemFields, itemIdx) => (
                <div key={itemIdx} className="rounded border border-indigo-200 bg-white">
                  {df.editingSubIdx === itemIdx ? (
                    /* ─ edit form for this sub-item ─ */
                    <div className="px-2 py-1.5 space-y-1.5">
                      <FixedItemFieldRows
                        fields={df.nestedItems![itemIdx]}
                        onFieldsChange={(updated) => {
                          const items = [...df.nestedItems!];
                          items[itemIdx] = updated;
                          updateField(i, { nestedItems: items });
                        }}
                        parentNode={df.nestedChildNode!}
                        depth={depth + 1}
                        inputScalarProps={inputScalarProps}
                        idPrefix={`${idPrefix}-${df.key}-edit-${itemIdx}`}
                      />
                      <div className="flex gap-1 pt-0.5">
                        <button className="flex-1 text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white rounded py-0.5 transition"
                          onClick={() => updateField(i, { editingSubIdx: null })}>Done</button>
                        <button className="flex-1 text-[10px] border border-gray-200 hover:bg-gray-50 text-gray-500 rounded py-0.5 transition"
                          onClick={() => updateField(i, { editingSubIdx: null })}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* ─ compact summary card ─ */
                    <div className="rounded border border-indigo-100 overflow-hidden">
                      {/* header row: #N, ✏, 🗑 */}
                      <div className="flex items-center justify-between px-1.5 py-0.5 bg-indigo-50">
                        <span className="text-[9px] font-semibold text-indigo-600">item #{itemIdx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button className="text-gray-300 hover:text-blue-500 transition"
                            onClick={() => updateField(i, { editingSubIdx: itemIdx })}>
                            <HiOutlinePencil size={11} />
                          </button>
                          <button className="text-gray-300 hover:text-rose-500 transition"
                            onClick={() => updateField(i, { nestedItems: (df.nestedItems ?? []).filter((_, ii) => ii !== itemIdx) })}>
                            <HiOutlineTrash size={11} />
                          </button>
                        </div>
                      </div>
                      {/* field-by-field content */}
                      <div className="px-2 py-1 space-y-0.5">
                        {itemFields.map((f, fi) => f.mode !== 'array' ? (
                          <div key={fi} className="flex items-center gap-1 text-[9px] font-mono">
                            <span className="text-indigo-700 flex-shrink-0">{f.key}:</span>
                            <span className="text-gray-500 truncate">
                              {f.mode === 'source' ? (f.transform ? `fx(${f.value})` : f.value) : (f.value || '—')}
                            </span>
                          </div>
                        ) : (
                          <div key={fi} className="text-[9px] font-mono text-indigo-500">
                            {f.key}[]: {(f.nestedItems ?? []).length} item{(f.nestedItems ?? []).length !== 1 ? 's' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* add sub-item */}
              {df.addingItem != null ? (
                <div className="bg-white rounded border border-indigo-100 p-1.5 space-y-1">
                  <FixedItemFieldRows
                    fields={df.addingItem!}
                    onFieldsChange={(updated) => updateField(i, { addingItem: updated })}
                    parentNode={df.nestedChildNode!}
                    depth={depth + 1}
                    inputScalarProps={inputScalarProps}
                    idPrefix={`${idPrefix}-${df.key}`}
                  />
                  <div className="flex gap-1 pt-0.5">
                    <button className="flex-1 text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white rounded py-0.5 transition"
                      onClick={() => {
                        const rec = draftFieldsToRecord(df.addingItem!);
                        if (Object.keys(rec).length > 0) {
                          updateField(i, { nestedItems: [...(df.nestedItems ?? []), df.addingItem!], addingItem: null });
                        }
                      }}>Add</button>
                    <button className="flex-1 text-[10px] border border-gray-200 hover:bg-gray-50 text-gray-500 rounded py-0.5 transition"
                      onClick={() => updateField(i, { addingItem: null })}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="text-[10px] text-indigo-600 hover:text-indigo-800 transition"
                  onClick={() => updateField(i, { addingItem: initDraftFieldsFromNode(df.nestedChildNode!) })}>
                  + item
                </button>
              )}
            </div>
          );
        }
        // leaf field (source / fixed)
        return (
          <div key={`${df.key}-leaf-${i}`} className="space-y-0.5">
            <div className="flex items-center gap-1">
              {hasFreeKey ? (
                <input className="w-20 border border-teal-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-teal-400"
                  placeholder="key" value={df.key}
                  onChange={(e) => updateField(i, { key: e.target.value })} />
              ) : (
                <span className="w-20 flex-shrink-0 font-mono text-teal-800 text-xs truncate">{df.key}</span>
              )}
              <div className="flex rounded overflow-hidden border border-teal-200 flex-shrink-0">
                {(['fixed', 'source'] as DraftFieldMode[]).map((m) => (
                  <button key={m}
                    className={`px-1.5 py-0.5 text-[10px] transition ${df.mode === m ? 'bg-teal-500 text-white' : 'bg-white text-teal-600 hover:bg-teal-50'}`}
                    onClick={() => updateField(i, { mode: m })}>{m}</button>
                ))}
              </div>
              {df.mode === 'source' ? (
                <>
                  <input list={`${idPrefix}-s-${i}`}
                    className="flex-1 min-w-0 border border-teal-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-teal-400"
                    placeholder="source.field" value={df.value}
                    onChange={(e) => updateField(i, { value: e.target.value })} />
                  {inputScalarProps.length > 0 && (
                    <datalist id={`${idPrefix}-s-${i}`}>
                      {inputScalarProps.map((p) => <option key={p} value={p} />)}
                    </datalist>
                  )}
                </>
              ) : (
                <input className="flex-1 min-w-0 border border-teal-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-teal-400"
                  placeholder="literal value" value={df.value}
                  onChange={(e) => updateField(i, { value: e.target.value })} />
              )}
              {df.mode === 'source' && (
                <button
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded border text-[10px] transition ${df.showTransform ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'}`}
                  onClick={() => updateField(i, { showTransform: !df.showTransform })}
                  title="Apply formula (use 'value' to refer to the source field)">fx</button>
              )}
            </div>
            {df.mode === 'source' && df.showTransform && (
              <input className="w-full border border-amber-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-amber-400"
                placeholder="e.g. value * 1.2" value={df.transform}
                onChange={(e) => updateField(i, { transform: e.target.value })} />
            )}
          </div>
        );
      })}
      {/* Nested array dropdown — schema-only, depth-gated */}
      {depth < FIXED_ITEM_MAX_DEPTH && availableArrayNodes.length > 0 && (
        <select
          className="w-full border border-indigo-200 bg-white rounded px-1.5 py-0.5 text-[10px] font-mono text-indigo-700 focus:outline-none focus:border-indigo-400"
          value=""
          onChange={(e) => {
            const childNode = childArrayNodes.find((c) => c.key === e.target.value);
            if (!childNode) return;
            onFieldsChange([...fields, {
              key: childNode.key, mode: 'array', value: '', transform: '', showTransform: false,
              nestedChildNode: childNode, nestedItems: [], addingItem: null,
            }]);
          }}>
          <option value="">＋ add nested array…</option>
          {availableArrayNodes.map((c) => <option key={c.key} value={c.key}>{c.key}[]</option>)}
        </select>
      )}
      {/* Free-key: add more rows */}
      {hasFreeKey && (
        <button className="text-[11px] text-teal-600 hover:text-teal-800 transition"
          onClick={() => onFieldsChange([...fields, { key: '', mode: 'fixed', value: '', transform: '', showTransform: false }])}>
          + field
        </button>
      )}
    </div>
  );
};
