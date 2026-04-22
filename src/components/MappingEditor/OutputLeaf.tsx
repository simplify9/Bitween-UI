import React, { useState, useCallback } from 'react';
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi';
import { TreeNode } from 'src/utils/mappingPreview';
import { ArrayMapping, LookupDictionary, LookupEntry } from './types';
import {
  useMappingEditorDispatch,
  useMappingEditorState,
  addFieldMapping,
  removeFieldMapping,
  selectMapping,
  updateFieldMapping,
} from './MappingEditorContext';
import { getFullTargetPrefix } from './mappingTreeUtils';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OutputLeafProps {
  node: TreeNode;
  sourcePaths: string[];
  typeMap: Record<string, 'string' | 'number' | 'boolean'>;
  onLeafRef?: (path: string, el: HTMLElement | null) => void;
  isSearchMatch?: boolean;
}

// ─── Helper: resolve a dot-path value from a parsed JSON object ───────────────

function getValueAtPath(obj: unknown, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[part];
  }
  if (current === null || current === undefined) return '';
  if (typeof current === 'object') return '';
  return String(current);
}

// ─── OutputLeaf ───────────────────────────────────────────────────────────────

export const OutputLeaf: React.FC<OutputLeafProps> = ({ node, sourcePaths, typeMap, onLeafRef, isSearchMatch }) => {
  const dispatch = useMappingEditorDispatch();
  const { fieldMappings, arrayMappings, selectedMappingId: selectedId, outputJson, partnerAdapterProperties } = useMappingEditorState();
  const [lookupOpen, setLookupOpen] = useState(false);
  const { data: globalSetsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });
  const allGlobalSets = globalSetsData?.result ?? [];

  // Type of this target field, derived from the typeMap passed from the tree root
  const targetFieldType = typeMap[node.path]

  // ── Detect if this leaf is an inner field of an array mapping ─────────────
  // Paths from buildTree for array items look like "products[*].sku"
  // or deeply nested: "orders[*].items[*].code"
  const isArrayField = node.path.includes('[*].');
  // The array container is everything up to (and including) the LAST [*] segment
  const lastStarIdx = isArrayField ? node.path.lastIndexOf('[*].') : -1;
  const arrayParentTarget = isArrayField ? node.path.substring(0, lastStarIdx) : ''; // e.g. "orders[*].items" or "products"
  const relativeKey = isArrayField ? node.path.substring(lastStarIdx + 4) : ''; // e.g. "code" or "sku"
  const arrayOwner = isArrayField
    ? arrayMappings.find((am) => {
        const fullPrefix = getFullTargetPrefix(am.id, arrayMappings);
        return fullPrefix === arrayParentTarget;
      })
    : undefined;
  const innerMapping = arrayOwner?.mappings.find((m) => m.target === relativeKey);

  // ── Normal field mapping lookup ───────────────────────────────────────────
  const mapping = !isArrayField ? fieldMappings.find((m) => m.target === node.path) : undefined;
  const isMapped = isArrayField
    ? Boolean(innerMapping?.source || innerMapping?.fixedValue !== undefined || innerMapping?.partnerPropKey || (innerMapping?.globalSetId && innerMapping?.globalKey))
    : Boolean(mapping?.source || mapping?.fixedValue !== undefined ||
        (mapping?.lookupDictionary?.entries?.length ?? 0) > 0 || mapping?.valuesSetId || mapping?.partnerPropKey ||
        (mapping?.globalSetId && mapping?.globalKey));
  const isSelected = mapping ? selectedId === mapping.id : false;

  // Derived mode: 'fixed' | 'source' | 'partner' | 'global'
  const currentMode = mapping?.partnerPropKey !== undefined ? 'partner' : mapping?.globalSetId !== undefined ? 'global' : mapping?.fixedValue !== undefined ? 'fixed' : 'source';
  const hasLookup = (mapping?.lookupDictionary?.entries?.length ?? 0) > 0;

  const ref = useCallback(
    (el: HTMLElement | null) => {
      onLeafRef?.(node.path, el);
    },
    [node.path, onLeafRef]
  );

  const handleDrop = (e: React.DragEvent) => {
    if (isArrayField) return;
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');
    if (!sourcePath) return;
    if (mapping) {
      dispatch(updateFieldMapping({
        id: mapping.id,
        source: sourcePath,
        fixedValue: undefined,
        valuesSetId: undefined,
      }));
    } else {
      dispatch(addFieldMapping({ source: sourcePath, target: node.path }));
    }
  };

  const switchMode = (e: React.MouseEvent, next: 'source' | 'fixed' | 'partner' | 'global') => {
    if (isArrayField) return;
    e.stopPropagation();
    if (next === 'fixed') {
      let sampleValue = '';
      try {
        const outputObj = JSON.parse(outputJson);
        sampleValue = getValueAtPath(outputObj, node.path);
      } catch { /* ignore parse errors */ }
      if (!mapping) {
        dispatch(addFieldMapping({ source: '', target: node.path, fixedValue: sampleValue }));
      } else {
        dispatch(updateFieldMapping({ id: mapping.id, source: '', fixedValue: sampleValue, partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, valuesSetId: undefined, lookupDictionary: undefined, transform: undefined }));
      }
      setLookupOpen(false);
    } else if (next === 'partner') {
      if (!mapping) {
        dispatch(addFieldMapping({ source: '', target: node.path, partnerPropKey: '' }));
      } else {
        dispatch(updateFieldMapping({ id: mapping.id, source: '', fixedValue: undefined, partnerPropKey: '', globalSetId: undefined, globalKey: undefined, valuesSetId: undefined, lookupDictionary: undefined, transform: undefined }));
      }
      setLookupOpen(false);
    } else if (next === 'global') {
      if (!mapping) {
        dispatch(addFieldMapping({ source: '', target: node.path, globalSetId: '', globalKey: '' }));
      } else {
        dispatch(updateFieldMapping({ id: mapping.id, source: '', fixedValue: undefined, partnerPropKey: undefined, globalSetId: '', globalKey: '', valuesSetId: undefined, lookupDictionary: undefined, transform: undefined }));
      }
      setLookupOpen(false);
    } else {
      // source mode
      if (!mapping) {
        dispatch(addFieldMapping({ source: '', target: node.path }));
      } else {
        dispatch(updateFieldMapping({ id: mapping.id, fixedValue: undefined, partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, valuesSetId: undefined }));
      }
    }
  };

  const handleSelect = () => {
    if (isArrayField) {
      // Array inner fields are read-only — managed via the loop button on the array node.
      return;
    }
    if (mapping) {
      dispatch(selectMapping(isSelected ? null : mapping.id));
    } else {
      dispatch(addFieldMapping({ source: '', target: node.path }));
    }
  };

  // ── Array inner field: read-only — managed via the array loop modal ───────
  if (isArrayField) {
    const displaySource = innerMapping?.source
      ? innerMapping.source
      : innerMapping?.fixedValue !== undefined
      ? `"${innerMapping.fixedValue}"`
      : innerMapping?.partnerPropKey
      ? `__partner__.${innerMapping.partnerPropKey}`
      : innerMapping?.globalSetId && innerMapping?.globalKey
      ? `__globals__.${innerMapping.globalSetId}["${innerMapping.globalKey}"]`
      : null;

    return (
      <div
        ref={ref}
        onClick={handleSelect}
        title="Managed by array mapping — click to open loop editor"
        className={['flex items-center gap-1.5 px-2 py-[3px] rounded border border-transparent text-xs cursor-pointer transition-all select-none hover:border-purple-200 hover:bg-purple-50', isSearchMatch ? 'bg-yellow-50 ring-1 ring-yellow-300' : ''].filter(Boolean).join(' ')}
      >
        <span
          className={[
            'w-2 h-2 rounded-full flex-shrink-0',
            isMapped ? 'bg-emerald-400' : 'bg-rose-300',
          ].join(' ')}
        />
        <span className="font-mono text-gray-700 truncate">{node.key}</span>
        <span className="text-gray-300 mx-0.5 flex-shrink-0">←</span>
        <span className={['font-mono text-xs truncate flex-1', displaySource ? 'text-purple-600' : 'text-gray-400'].join(' ')}>
          {displaySource ?? '— unassigned —'}
        </span>
        <span className="text-[10px] text-purple-400 border border-purple-200 rounded px-1 flex-shrink-0 bg-purple-50">
          loop
        </span>
      </div>
    );
  }

  // ── Normal (non-array) leaf ───────────────────────────────────────────────
  return (
    <div
      ref={ref}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleSelect}
      className={[
        'rounded border text-xs cursor-pointer transition-all select-none',
        isSelected
          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
          : isSearchMatch
          ? 'bg-yellow-50 ring-1 ring-yellow-300'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-1.5 px-2 py-[3px]">
        <span
          className={[
            'w-2 h-2 rounded-full flex-shrink-0',
            isMapped ? 'bg-emerald-400' : 'bg-rose-300',
          ].join(' ')}
        />
        <span className="font-mono text-gray-700 truncate">{node.key}</span>
        <span className="text-gray-300 mx-0.5 flex-shrink-0">←</span>

        {/* Mode buttons: Source / Fixed / Partner / Global */}
        <div className="flex flex-shrink-0 rounded overflow-hidden border border-gray-200 text-[10px] font-medium">
          <button
            onClick={(e) => switchMode(e, 'source')}
            className={currentMode === 'source' ? 'px-1.5 py-0.5 bg-blue-500 text-white' : 'px-1.5 py-0.5 text-gray-400 hover:bg-gray-50'}
          >Source</button>
          <button
            onClick={(e) => switchMode(e, 'fixed')}
            className={currentMode === 'fixed' ? 'px-1.5 py-0.5 bg-amber-500 text-white' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
          >Fixed</button>
          <button
              onClick={(e) => { e.stopPropagation(); switchMode(e, 'partner'); }}
              className={currentMode === 'partner' ? 'px-1.5 py-0.5 bg-emerald-500 text-white border-l border-emerald-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
            >Partner</button>
          <button
            onClick={(e) => { e.stopPropagation(); switchMode(e, 'global'); }}
            className={currentMode === 'global' ? 'px-1.5 py-0.5 bg-teal-500 text-white border-l border-teal-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
          >Global</button>
        </div>
        {currentMode === 'source' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLookupOpen((v) => {
                if (v && mapping) {
                  const entries = mapping.lookupDictionary?.entries ?? [];
                  const hasValid = entries.some(e => e.from.trim() !== '' && e.to.trim() !== '');
                  if (!hasValid) {
                    dispatch(updateFieldMapping({ id: mapping.id, lookupDictionary: undefined }));
                  }
                }
                return !v;
              });
            }}
            title={hasLookup ? `Lookup: ${mapping!.lookupDictionary!.entries.length} entries` : 'Map source values to different output values'}
            className={[
              'flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border transition',
              hasLookup || lookupOpen
                ? 'border-violet-400 bg-violet-50 text-violet-600'
                : 'border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
            ].join(' ')}
          >Lookup</button>
        )}

        {/* Value / path display based on current mode */}
        {currentMode === 'fixed' ? (
          targetFieldType === 'boolean' ? (
            <select
              className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0"
              value={mapping?.fixedValue ?? ''}
              onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, fixedValue: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">— pick —</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0 placeholder-amber-300"
              placeholder={targetFieldType === 'number' ? '0' : 'fixed value…'}
              type={targetFieldType === 'number' ? 'number' : 'text'}
              value={mapping?.fixedValue ?? ''}
              onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, fixedValue: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
            />
          )
        ) : currentMode === 'partner' ? (
          <div className="flex-1 relative min-w-0" onClick={(e) => e.stopPropagation()}>
            <input
              list={`partner-props-${mapping?.id}`}
              className="w-full border-0 bg-transparent font-mono text-xs focus:outline-none text-emerald-600 placeholder-emerald-300"
              placeholder="property key…"
              value={mapping?.partnerPropKey ?? ''}
              onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, partnerPropKey: e.target.value }))}
            />
            <datalist id={`partner-props-${mapping?.id}`}>
              {Object.keys(partnerAdapterProperties).map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </div>
        ) : currentMode === 'global' ? (
          <div className="flex gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <select
              className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-600 flex-1 min-w-0"
              value={mapping?.globalSetId ?? ''}
              onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, globalSetId: e.target.value, globalKey: '' }))}
            >
              <option value="">— pick set —</option>
              {allGlobalSets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {mapping?.globalSetId && (
              <select
                className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-500 flex-1 min-w-0"
                value={mapping?.globalKey ?? ''}
                onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, globalKey: e.target.value }))}
              >
                <option value="">— pick key —</option>
                {Object.keys(allGlobalSets.find((s) => s.id === mapping?.globalSetId)?.values ?? {}).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <select
            className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-gray-500 min-w-0"
            value={mapping?.source ?? ''}
            onChange={(e) => {
              if (mapping) {
                dispatch(updateFieldMapping({
                  id: mapping.id,
                  source: e.target.value,
                  fixedValue: undefined,
                  partnerPropKey: undefined,
                  valuesSetId: undefined,
                  lookupDictionary: undefined,
                }));
              } else {
                dispatch(addFieldMapping({ source: e.target.value, target: node.path }));
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">— unassigned —</option>
            {sourcePaths.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        {/* Transform badge — shown when NOT selected but transform exists */}
        {!isSelected && mapping?.transform && currentMode === 'source' && (
          <span
            title={`Transform: ${mapping.transform}`}
            className="flex-shrink-0 text-[10px] font-medium text-violet-600 border border-violet-200 bg-violet-50 rounded px-1 cursor-default"
          >
            transform
          </span>
        )}

        {mapping && (
          <button
            className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(removeFieldMapping(mapping.id));
            }}
          >
            <HiOutlineTrash size={12} />
          </button>
        )}
      </div>

      {/* ── Lookup dictionary panel — shown when lookupOpen ── */}
      {lookupOpen && currentMode === 'source' && (
        <div className="px-2 pb-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-2 space-y-1.5">
            {/* Entry rows */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {(mapping?.lookupDictionary?.entries ?? []).length === 0 && (
                <p className="text-[10px] text-violet-400 italic px-1">No entries yet.</p>
              )}
              {(mapping?.lookupDictionary?.entries ?? []).map((entry: LookupEntry, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  <input
                    autoFocus={idx === 0}
                    className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
                    placeholder="source value"
                    value={entry.from}
                    onChange={(e) => {
                      const val = e.target.value;
                      dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                        ...mapping!.lookupDictionary!,
                        entries: mapping!.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, from: val } : ee),
                      }}));
                    }}
                  />
                  <span className="text-gray-300 text-[10px] flex-shrink-0 select-none">→</span>
                  {/* output value — type-constrained */}
                  {targetFieldType === 'boolean' ? (
                    <select
                      className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                      value={entry.to}
                      onChange={(e) => {
                        const val = e.target.value;
                        dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                          ...mapping!.lookupDictionary!,
                          entries: mapping!.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, to: val } : ee),
                        }}));
                      }}
                    >
                      <option value="">— pick —</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      type={targetFieldType === 'number' ? 'number' : 'text'}
                      className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
                      placeholder={targetFieldType === 'number' ? '0' : 'output value'}
                      value={entry.to}
                      onChange={(e) => {
                        const val = e.target.value;
                        dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                          ...mapping!.lookupDictionary!,
                          entries: mapping!.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, to: val } : ee),
                        }}));
                      }}
                    />
                  )}
                  <button
                    className="flex-shrink-0 text-gray-300 hover:text-rose-400 transition"
                    onClick={() => dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                      ...mapping!.lookupDictionary!,
                      entries: mapping!.lookupDictionary!.entries.filter((_, i) => i !== idx),
                    }}))}
                  >
                    <HiOutlineTrash size={11} />
                  </button>
                </div>
              ))}
            </div>
            {/* Add entry */}
            <button
              className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 transition font-medium"
              onClick={() => dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                ...(mapping!.lookupDictionary ?? { fallback: 'null' as const }),
                entries: [...(mapping!.lookupDictionary?.entries ?? []), { from: '', to: '' }],
              }}))}
            >
              <HiOutlinePlusCircle size={11} /> Add entry
            </button>
            {/* Fallback — only shown once at least one entry exists */}
            {(mapping?.lookupDictionary?.entries?.length ?? 0) > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-violet-200">
              <span className="text-[10px] text-gray-500 flex-shrink-0 select-none">If not found:</span>
              <select
                className="text-xs border border-violet-200 bg-white rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                value={mapping?.lookupDictionary?.fallback ?? 'null'}
                onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                  ...mapping!.lookupDictionary!,
                  fallback: e.target.value as LookupDictionary['fallback'],
                }}))}
              >
                <option value="null">output null</option>
                <option value="custom">use custom fallback</option>
              </select>
              {mapping?.lookupDictionary?.fallback === 'custom' && (
                targetFieldType === 'boolean' ? (
                  <select
                    className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                    value={mapping.lookupDictionary.fallbackValue ?? ''}
                    onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: { ...mapping!.lookupDictionary!, fallbackValue: e.target.value } }))}
                  >
                    <option value="">— pick —</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    type={targetFieldType === 'number' ? 'number' : 'text'}
                    className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300 text-violet-700"
                    placeholder={targetFieldType === 'number' ? '0' : 'fallback value'}
                    value={mapping.lookupDictionary.fallbackValue ?? ''}
                    onChange={(e) => dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: {
                      ...mapping!.lookupDictionary!,
                      fallbackValue: e.target.value,
                    }}))}
                  />
                )
              )}
            </div>
            )}
            {/* Clear lookup */}
            <button
              className="text-[10px] text-rose-400 hover:text-rose-600 transition"
              onClick={() => {
                dispatch(updateFieldMapping({ id: mapping!.id, lookupDictionary: undefined }));
                setLookupOpen(false);
              }}
            >Remove lookup</button>
          </div>
        </div>
      )}

      {/* ── Expression row — only when selected + source mode + source assigned + no lookup active ── */}
      {isSelected && currentMode === 'source' && mapping?.source && !hasLookup && (
        <div
          className="px-2 pb-1.5 space-y-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-medium text-violet-600 select-none">Transform <span className="font-normal text-gray-400">(optional — modify the source value before output)</span></span>
          <input
            className="w-full border border-violet-200 bg-white rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300 text-violet-700"
            placeholder="e.g.  value * 1.2    or    value + ' USD'    — use 'value' to refer to the source field"
            value={mapping.transform ?? ''}
            onChange={(e) =>
              dispatch(updateFieldMapping({ id: mapping.id, transform: e.target.value || undefined }))
            }
          />
        </div>
      )}
    </div>
  );
};
