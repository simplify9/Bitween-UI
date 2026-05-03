import React, { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { TreeNode } from 'src/utils/mappingPreview';
import { LookupDictionary, LookupEntry } from 'src/types/mapping';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';
import { useMappingEditorState } from '../context/MappingEditorContext';
import { ModeToggleButtons } from '../ModeToggleButtons';
import { LeafValueInput } from '../LeafValueInput';
import { LookupDictionaryPanel } from '../LookupDictionaryPanel';

// ─── Fixed-item inline panel types ───────────────────────────────────────────

export type DraftFieldMode = 'source' | 'fixed' | 'array' | 'partner' | 'global';

export interface DraftField {
  key: string;
  mode: DraftFieldMode;
  value: string;
  transform: string;
  showTransform: boolean;
  // partner mode:
  partnerPropKey?: string;
  // global mode:
  globalSetId?: string;
  globalKey?: string;
  // source lookup dictionary:
  lookupDictionary?: LookupDictionary;
  // array mode only:
  nestedChildNode?: TreeNode;
  nestedItems?: DraftField[][];
  addingItem?: DraftField[] | null;
  editingSubIdx?: number | null;
}

export const FIXED_ITEM_MAX_DEPTH = 2; // 0-based: depths 0,1,2 → 3 nesting levels

/** Recursively collect leaf keys from tree children, using dot-notation for nested objects. */
function collectLeafKeysFromChildren(children: TreeNode[], prefix = ''): string[] {
  return children.flatMap((c) => {
    const path = prefix ? `${prefix}.${c.key}` : c.key;
    if (c.type === 'leaf') return [path];
    if (c.type === 'object') return collectLeafKeysFromChildren(c.children, path);
    return []; // skip arrays — handled separately
  });
}

export function initDraftFieldsFromNode(node: TreeNode | undefined): DraftField[] {
  if (!node) return [{ key: '', mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }];
  const leafKeys = collectLeafKeysFromChildren(node.children);
  if (leafKeys.length > 0) {
    return leafKeys.map((key) => ({ key, mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }));
  }
  return [{ key: '', mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }];
}

function parseLookupEntries(dictStr: string): LookupEntry[] {
  const entries: LookupEntry[] = [];
  const re = /"([^"]+)": "([^"]*)"/g;
  let m;
  while ((m = re.exec(dictStr)) !== null) entries.push({ from: m[1], to: m[2] });
  return entries;
}

/** Set a value at a dotted path inside a record, creating intermediate objects as needed. */
function setRecordByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null || Array.isArray(cur[parts[i]])) {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function draftFieldsToRecord(fields: DraftField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const df of fields) {
    const k = df.key.trim();
    if (!k) continue;
    if (df.mode === 'array') {
      setRecordByPath(result, k, (df.nestedItems ?? []).map((itemFields) => draftFieldsToRecord(itemFields)));
    } else if (df.mode === 'partner') {
      if (!df.partnerPropKey?.trim()) continue;
      setRecordByPath(result, k, `{{__partner__?.${df.partnerPropKey.trim()}}}`);
    } else if (df.mode === 'global') {
      if (!df.globalSetId?.trim() || !df.globalKey?.trim()) continue;
      setRecordByPath(result, k, `{{__globals__?.${df.globalSetId.trim()}["${df.globalKey.trim()}"]}}`);
    } else if (df.mode === 'source') {
      if (!df.value.trim()) continue;
      const src = df.value.trim();
      const lkp = df.lookupDictionary;
      if (lkp?.entries?.length) {
        const valid = lkp.entries.filter(({ from, to }) => from.trim() !== '' && to.trim() !== '');
        if (valid.length > 0) {
          const entriesStr = valid.map(({ from, to }) => `"${from}": "${to}"`).join(', ');
          if (lkp.fallback === 'null') {
            setRecordByPath(result, k, `{{$__e = { ${entriesStr} }; $__e[${src}]}}`);
          } else {
            const fb = lkp.fallback === 'custom' ? `"${lkp.fallbackValue ?? ''}"` : src;
            setRecordByPath(result, k, `{{$__e = { ${entriesStr} }; ($__e[${src}] ?? ${fb})}}`);
          }
          continue;
        }
      }
      const expr = df.transform.trim()
        ? df.transform.trim().replace(/\bvalue\b/g, src)
        : src;
      setRecordByPath(result, k, `{{${expr}}}`);
    } else {
      if (df.value.trim() === '') continue;
      const raw = df.value.trim();
      const n = Number(raw);
      if (raw !== '' && !isNaN(n)) setRecordByPath(result, k, n);
      else if (raw === 'true') setRecordByPath(result, k, true);
      else if (raw === 'false') setRecordByPath(result, k, false);
      else setRecordByPath(result, k, raw);
    }
  }
  return result;
}

/** Flatten a nested record to dotted-path keys, keeping arrays as single entries. */
function flattenRecordKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) return [path]; // arrays kept as-is
    if (v && typeof v === 'object') return flattenRecordKeys(v as Record<string, unknown>, path);
    return [path];
  });
}

/** Get a value at a dotted path from a nested record. */
function getRecordByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((cur: Record<string, unknown> | undefined, k) => (
    cur != null && typeof cur === 'object' ? cur[k] as Record<string, unknown> | undefined : undefined
  ), obj as Record<string, unknown> | undefined);
}

export function recordToDraftFields(item: Record<string, unknown>, node: TreeNode): DraftField[] {
  const nodeLeafKeys = collectLeafKeysFromChildren(node.children);
  const arrayChildren = node.children.filter((c) => c.type === 'array');
  const itemKeys = flattenRecordKeys(item);
  const allKeys = [...new Set([...nodeLeafKeys, ...itemKeys])];
  return allKeys.map((key): DraftField => {
    const v = getRecordByPath(item, key);
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
      if (m) {
        const expr = m[1].trim();
        // Partner: {{__partner__?.propkey}}
        const partnerMatch = expr.match(/^__partner__\??\.([\w]+)$/);
        if (partnerMatch) return { key, mode: 'partner', value: '', transform: '', showTransform: false, partnerPropKey: partnerMatch[1] };
        // Global: {{__globals__?.setid["key"]}}
        const globalMatch = expr.match(/^__globals__\??\.([\w]+)\["([^"]+)"\]$/);
        if (globalMatch) return { key, mode: 'global', value: '', transform: '', showTransform: false, globalSetId: globalMatch[1], globalKey: globalMatch[2] };
        // Lookup (null fallback): $__e = { ... }; $__e[path]
        const lkpNull = expr.match(/^\$__e = \{ (.+) \}; \$__e\[(.+)\]$/);
        if (lkpNull) return { key, mode: 'source', value: lkpNull[2], transform: '', showTransform: false, lookupDictionary: { entries: parseLookupEntries(lkpNull[1]), fallback: 'null' } };
        // Lookup (passthrough/custom): $__e = { ... }; ($__e[path] ?? FB)
        const lkpFb = expr.match(/^\$__e = \{ (.+) \}; \(\$__e\[(.+)\] \?\? (.+)\)$/);
        if (lkpFb) {
          const path = lkpFb[2];
          const fbStr = lkpFb[3];
          const isPassthrough = fbStr === path;
          return { key, mode: 'source', value: path, transform: '', showTransform: false, lookupDictionary: {
            entries: parseLookupEntries(lkpFb[1]),
            fallback: isPassthrough ? 'passthrough' : 'custom',
            fallbackValue: isPassthrough ? undefined : fbStr.replace(/^"(.*)"$/, '$1'),
          }};
        }
        return { key, mode: 'source', value: expr, transform: '', showTransform: false };
      }
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
  typeMap?: Record<string, 'string' | 'number' | 'boolean'>;
}

export const FixedItemFieldRows: React.FC<FixedItemFieldRowsProps> = ({
  fields, onFieldsChange, parentNode, depth, inputScalarProps, idPrefix, typeMap,
}) => {
  const { partnerAdapterProperties } = useMappingEditorState();
  const { data: globalSetsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });
  const allGlobalSets = globalSetsData?.result ?? [];
  const [lookupOpenIdx, setLookupOpenIdx] = useState<number | null>(null);

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
                        typeMap={typeMap}
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
                              {f.mode === 'source' ? (f.transform ? `fx(${f.value})` : f.value)
                                : f.mode === 'partner' ? `__partner__.${f.partnerPropKey ?? ''}`
                                : f.mode === 'global' ? `__globals__.${f.globalSetId ?? ''}["${f.globalKey ?? ''}"]`
                                : (f.value || '—')}
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
                    typeMap={typeMap}
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
        // leaf field (fixed / source / partner / global)
        const hasLookup = (df.lookupDictionary?.entries?.length ?? 0) > 0;
        const isLookupOpen = lookupOpenIdx === i;
        const fieldTargetType = typeMap?.[`${parentNode.path}.${df.key}`];
        return (
          <div key={`${df.key}-leaf-${i}`} className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              {hasFreeKey ? (
                <input
                  className="w-20 flex-shrink-0 border border-gray-200 bg-transparent rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                  placeholder="key" value={df.key}
                  onChange={(e) => updateField(i, { key: e.target.value })} />
              ) : (
                <span className="max-w-[10rem] flex-shrink-0 font-mono text-gray-700 text-xs truncate" title={df.key}>{df.key}</span>
              )}
              <span className="text-gray-300 flex-shrink-0">←</span>

              <ModeToggleButtons
                current={(df.mode as DraftFieldMode) === 'array' ? 'source' : df.mode}
                onChange={(next) => {
                  setLookupOpenIdx(null);
                  if (next === 'source') updateField(i, { mode: 'source', partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined });
                  else if (next === 'fixed') updateField(i, { mode: 'fixed', value: '', partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined });
                  else if (next === 'partner') updateField(i, { mode: 'partner', value: '', transform: '', globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined });
                  else if (next === 'global') updateField(i, { mode: 'global', value: '', transform: '', partnerPropKey: undefined, lookupDictionary: undefined });
                }}
              />

              {/* Lookup button — only in source mode, matches OutputLeaf styling */}
              {df.mode === 'source' && (
                <button
                  onClick={() => {
                    if (isLookupOpen && !hasLookup) {
                      updateField(i, { lookupDictionary: undefined });
                    }
                    setLookupOpenIdx(isLookupOpen ? null : i);
                  }}
                  title={hasLookup ? `Lookup: ${df.lookupDictionary!.entries.length} entries` : 'Map source values to different output values'}
                  className={[
                    'flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border transition',
                    hasLookup || isLookupOpen
                      ? 'border-violet-400 bg-violet-50 text-violet-600'
                      : 'border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
                  ].join(' ')}
                >Lookup</button>
              )}

              {/* Value area */}
              <LeafValueInput
                mode={df.mode as 'source' | 'fixed' | 'partner' | 'global'}
                sourceValue={df.value}
                sourcePaths={inputScalarProps}
                onSourceChange={(v) => updateField(i, { value: v })}
                fixedValue={df.value}
                targetFieldType={fieldTargetType}
                onFixedChange={(v) => updateField(i, { value: v })}
                partnerPropKey={df.partnerPropKey ?? ''}
                partnerAdapterProperties={partnerAdapterProperties}
                datalistId={`${idPrefix}-partner-${i}`}
                onPartnerChange={(v) => updateField(i, { partnerPropKey: v })}
                globalSetId={df.globalSetId ?? ''}
                globalKey={df.globalKey ?? ''}
                allGlobalSets={allGlobalSets}
                onGlobalSetChange={(setId) => updateField(i, { globalSetId: setId, globalKey: undefined })}
                onGlobalKeyChange={(key) => updateField(i, { globalKey: key })}
              />

              {/* Delete row — only for free-key fields */}
              {hasFreeKey && (
                <button
                  className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
                  onClick={() => { onFieldsChange(fields.filter((_, j) => j !== i)); if (lookupOpenIdx === i) setLookupOpenIdx(null); }}>
                  <HiOutlineTrash size={12} />
                </button>
              )}
            </div>

            {/* Lookup dictionary panel */}
            {df.mode === 'source' && isLookupOpen && (
              <div className="px-2 pb-2 pt-0.5">
                <LookupDictionaryPanel
                  dictionary={df.lookupDictionary}
                  targetFieldType={fieldTargetType}
                  onChange={(next) => { updateField(i, { lookupDictionary: next }); if (!next) setLookupOpenIdx(null); }}
                  onClose={() => setLookupOpenIdx(null)}
                />
              </div>
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
