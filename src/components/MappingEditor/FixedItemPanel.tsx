import React, { useState } from 'react';
import { HiOutlinePencil, HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi';
import { TreeNode } from 'src/utils/mappingPreview';
import { LookupDictionary, LookupEntry } from './types';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';
import { useMappingEditorState } from './MappingEditorContext';

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

export function initDraftFieldsFromNode(node: TreeNode | undefined): DraftField[] {
  if (!node) return [{ key: '', mode: 'fixed' as DraftFieldMode, value: '', transform: '', showTransform: false }];
  const leafKeys = node.children.filter((c) => c.type === 'leaf').map((c) => c.key);
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

export function draftFieldsToRecord(fields: DraftField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const df of fields) {
    const k = df.key.trim();
    if (!k) continue;
    if (df.mode === 'array') {
      result[k] = (df.nestedItems ?? []).map((itemFields) => draftFieldsToRecord(itemFields));
    } else if (df.mode === 'partner') {
      if (!df.partnerPropKey?.trim()) continue;
      result[k] = `{{__partner__?.${df.partnerPropKey.trim()}}}`;
    } else if (df.mode === 'global') {
      if (!df.globalSetId?.trim() || !df.globalKey?.trim()) continue;
      result[k] = `{{__globals__?.${df.globalSetId.trim()}["${df.globalKey.trim()}"]}}` ;
    } else if (df.mode === 'source') {
      if (!df.value.trim()) continue;
      const src = df.value.trim();
      const lkp = df.lookupDictionary;
      if (lkp?.entries?.length) {
        const valid = lkp.entries.filter(({ from, to }) => from.trim() !== '' && to.trim() !== '');
        if (valid.length > 0) {
          const entriesStr = valid.map(({ from, to }) => `"${from}": "${to}"`).join(', ');
          if (lkp.fallback === 'null') {
            result[k] = `{{$__e = { ${entriesStr} }; $__e[${src}]}}`;
          } else {
            const fb = lkp.fallback === 'custom' ? `"${lkp.fallbackValue ?? ''}"` : src;
            result[k] = `{{$__e = { ${entriesStr} }; ($__e[${src}] ?? ${fb})}}`;
          }
          continue;
        }
      }
      const expr = df.transform.trim()
        ? df.transform.trim().replace(/\bvalue\b/g, src)
        : src;
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
}

export const FixedItemFieldRows: React.FC<FixedItemFieldRowsProps> = ({
  fields, onFieldsChange, parentNode, depth, inputScalarProps, idPrefix,
}) => {
  const { partnerAdapterProperties, selectedPartnerId } = useMappingEditorState();
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
        return (
          <div key={`${df.key}-leaf-${i}`} className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              {hasFreeKey ? (
                <input
                  className="w-20 flex-shrink-0 border border-gray-200 bg-transparent rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                  placeholder="key" value={df.key}
                  onChange={(e) => updateField(i, { key: e.target.value })} />
              ) : (
                <span className="w-20 flex-shrink-0 font-mono text-gray-700 text-xs truncate">{df.key}</span>
              )}
              <span className="text-gray-300 flex-shrink-0">←</span>

              {/* Mode buttons — same style as OutputLeaf */}
              <div className="flex flex-shrink-0 rounded overflow-hidden border border-gray-200 text-[10px] font-medium">
                <button
                  onClick={() => updateField(i, { mode: 'source', partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined })}
                  className={df.mode === 'source' ? 'px-1.5 py-0.5 bg-blue-500 text-white' : 'px-1.5 py-0.5 text-gray-400 hover:bg-gray-50'}
                >Source</button>
                <button
                  onClick={() => { updateField(i, { mode: 'fixed', value: '', partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined }); setLookupOpenIdx(null); }}
                  className={df.mode === 'fixed' ? 'px-1.5 py-0.5 bg-amber-500 text-white' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                >Fixed</button>
                <button
                  onClick={() => { updateField(i, { mode: 'partner', value: '', transform: '', globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined }); setLookupOpenIdx(null); }}
                  className={df.mode === 'partner' ? 'px-1.5 py-0.5 bg-emerald-500 text-white border-l border-emerald-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                >Partner</button>
                <button
                  onClick={() => { updateField(i, { mode: 'global', value: '', transform: '', partnerPropKey: undefined, lookupDictionary: undefined }); setLookupOpenIdx(null); }}
                  className={df.mode === 'global' ? 'px-1.5 py-0.5 bg-teal-500 text-white border-l border-teal-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                >Global</button>
              </div>

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
              {df.mode === 'source' && (
                <select
                  className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-gray-500 min-w-0"
                  value={df.value}
                  onChange={(e) => updateField(i, { value: e.target.value })}>
                  <option value="">— unassigned —</option>
                  {inputScalarProps.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {df.mode === 'fixed' && (
                <input
                  className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0 placeholder-amber-300"
                  placeholder="fixed value…"
                  value={df.value}
                  onChange={(e) => updateField(i, { value: e.target.value })} />
              )}
              {df.mode === 'partner' && (
                <>
                  <input
                    list={`${idPrefix}-partner-${i}`}
                    className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-emerald-600 min-w-0 placeholder-emerald-300"
                    placeholder="property key…"
                    value={df.partnerPropKey ?? ''}
                    onChange={(e) => updateField(i, { partnerPropKey: e.target.value })} />
                  <datalist id={`${idPrefix}-partner-${i}`}>
                    {Object.keys(partnerAdapterProperties).map((p) => <option key={p} value={p} />)}
                  </datalist>
                </>
              )}
              {df.mode === 'global' && (
                <div className="flex gap-1 flex-1 min-w-0">
                  <select
                    className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-600 flex-1 min-w-0"
                    value={df.globalSetId ?? ''}
                    onChange={(e) => updateField(i, { globalSetId: e.target.value, globalKey: undefined })}>
                    <option value="">— pick set —</option>
                    {allGlobalSets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {df.globalSetId && (
                    <select
                      className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-500 flex-1 min-w-0"
                      value={df.globalKey ?? ''}
                      onChange={(e) => updateField(i, { globalKey: e.target.value })}>
                      <option value="">— pick key —</option>
                      {Object.keys(allGlobalSets.find((s) => s.id === df.globalSetId)?.values ?? {}).map((vk) =>
                        <option key={vk} value={vk}>{vk}</option>
                      )}
                    </select>
                  )}
                </div>
              )}

              {/* Delete row — only for free-key fields */}
              {hasFreeKey && (
                <button
                  className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
                  onClick={() => { onFieldsChange(fields.filter((_, j) => j !== i)); if (lookupOpenIdx === i) setLookupOpenIdx(null); }}>
                  <HiOutlineTrash size={12} />
                </button>
              )}
            </div>

            {/* Lookup dictionary panel — matches OutputLeaf exactly */}
            {df.mode === 'source' && isLookupOpen && (
              <div className="px-2 pb-2 pt-0.5">
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-2 space-y-1.5">
                  {/* Entry rows */}
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {(df.lookupDictionary?.entries ?? []).length === 0 && (
                      <p className="text-[10px] text-violet-400 italic px-1">No entries yet.</p>
                    )}
                    {(df.lookupDictionary?.entries ?? []).map((entry: LookupEntry, idx: number) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          autoFocus={idx === 0}
                          className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
                          placeholder="source value"
                          value={entry.from}
                          onChange={(e) => {
                            const val = e.target.value;
                            const lkp = df.lookupDictionary!;
                            updateField(i, { lookupDictionary: { ...lkp, entries: lkp.entries.map((ee, ei) => ei === idx ? { ...ee, from: val } : ee) } });
                          }}
                        />
                        <span className="text-gray-300 text-[10px] flex-shrink-0 select-none">→</span>
                        <input
                          className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
                          placeholder="output value"
                          value={entry.to}
                          onChange={(e) => {
                            const val = e.target.value;
                            const lkp = df.lookupDictionary!;
                            updateField(i, { lookupDictionary: { ...lkp, entries: lkp.entries.map((ee, ei) => ei === idx ? { ...ee, to: val } : ee) } });
                          }}
                        />
                        <button
                          className="flex-shrink-0 text-gray-300 hover:text-rose-400 transition"
                          onClick={() => {
                            const lkp = df.lookupDictionary!;
                            updateField(i, { lookupDictionary: { ...lkp, entries: lkp.entries.filter((_, ei) => ei !== idx) } });
                          }}
                        >
                          <HiOutlineTrash size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add entry */}
                  <button
                    className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 transition font-medium"
                    onClick={() => {
                      const existing = df.lookupDictionary ?? { entries: [], fallback: 'passthrough' as const };
                      updateField(i, { lookupDictionary: { ...existing, entries: [...existing.entries, { from: '', to: '' }] } });
                    }}
                  >
                    <HiOutlinePlusCircle size={11} /> Add entry
                  </button>
                  {/* Fallback — only when at least one entry */}
                  {(df.lookupDictionary?.entries?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-violet-200">
                      <span className="text-[10px] text-gray-500 flex-shrink-0 select-none">If not found:</span>
                      <select
                        className="text-xs border border-violet-200 bg-white rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                        value={df.lookupDictionary?.fallback ?? 'passthrough'}
                        onChange={(e) => updateField(i, { lookupDictionary: { ...df.lookupDictionary!, fallback: e.target.value as LookupDictionary['fallback'] } })}
                      >
                        <option value="passthrough">keep original value</option>
                        <option value="null">output null</option>
                        <option value="custom">use custom fallback</option>
                      </select>
                      {df.lookupDictionary?.fallback === 'custom' && (
                        <input
                          className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300 text-violet-700"
                          placeholder="fallback value"
                          value={df.lookupDictionary.fallbackValue ?? ''}
                          onChange={(e) => updateField(i, { lookupDictionary: { ...df.lookupDictionary!, fallbackValue: e.target.value } })}
                        />
                      )}
                    </div>
                  )}
                  {/* Remove lookup */}
                  <button
                    className="text-[10px] text-rose-400 hover:text-rose-600 transition"
                    onClick={() => { updateField(i, { lookupDictionary: undefined }); setLookupOpenIdx(null); }}
                  >Remove lookup</button>
                </div>
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
