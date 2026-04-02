import React, { useEffect, useState } from 'react';
import { HiOutlineTrash, HiPlusCircle, HiX } from 'react-icons/hi';
import { useAppDispatch, useTypedSelector } from 'src/state/ReduxSotre';
import {
  addArrayFieldMapping,
  addArrayMapping,
  FilterOperator,
  genId,
  openArrayModal,
  removeArrayFieldMapping,
  removeArrayMapping,
  updateArrayFieldMapping,
  updateArrayMapping,
} from 'src/state/stateSlices/mappingEditor';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

const OPERATORS: { label: string; value: FilterOperator }[] = [
  { label: '==', value: '==' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
];

// ─── ArrayMappingModal ────────────────────────────────────────────────────────

const ArrayMappingModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const editingArrayId = useTypedSelector((s) => s.mappingEditor.editingArrayId);
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const inputJson = useTypedSelector((s) => s.mappingEditor.inputJson);
  const outputJson = useTypedSelector((s) => s.mappingEditor.outputJson);
  const newArrayPresetTarget = useTypedSelector((s) => s.mappingEditor.newArrayPresetTarget);

  // Derive source array paths from input JSON
  const sourceArrayPaths: string[] = React.useMemo(() => {
    try {
      const obj = JSON.parse(inputJson);
      return collectArrayPaths(obj);
    } catch {
      return [];
    }
  }, [inputJson]);

  // Derive target array paths from output JSON
  const targetArrayPaths: string[] = React.useMemo(() => {
    try {
      const obj = JSON.parse(outputJson);
      return collectArrayPaths(obj);
    } catch {
      return [];
    }
  }, [outputJson]);

  const am = arrayMappings.find((m) => m.id === editingArrayId);

  // Local editable state (synced from Redux on open)
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [alias, setAlias] = useState('item');
  const [hasFilter, setHasFilter] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [filterOp, setFilterOp] = useState<FilterOperator>('!=');
  const [filterValue, setFilterValue] = useState('');
  const [pendingMappings, setPendingMappings] = useState<Array<{ id: string; source: string; target: string; transform?: string; valuesSetId?: string; fixedValue?: string }>>([]);
  // Which secondary panel is open for each mapping row: 'transform' | 'enum' | 'fixed' | null
  const [openPanels, setOpenPanels] = useState<Record<string, 'transform' | 'enum' | 'fixed' | null>>({});

  // Global adapter values sets for enum lookup
  const { data: setsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });
  const valuesSets = setsData?.result ?? [];

  // Derive which secondary panel should be shown for a given row (data-driven fallback)
  const getPanel = (m: { id: string; transform?: string; valuesSetId?: string; fixedValue?: string }): 'transform' | 'enum' | 'fixed' | null => {
    if (m.id in openPanels) return openPanels[m.id];
    if (('fixedValue' in m) && (m as any).fixedValue !== undefined) return 'fixed';
    if (('valuesSetId' in m) && (m as any).valuesSetId) return 'enum';
    if (m.transform) return 'transform';
    return null;
  };

  // Dropdown suggestions for source item fields (relative names from array items)
  const sourceItemProps = React.useMemo(() => getItemProperties(inputJson, source), [inputJson, source]);

  // Dropdown suggestions for target item fields (from outputJson at target path)
  const targetItemProps = React.useMemo(() => {
    // Strip trailing [*] — am.target is stored as "products[*]" from the output tree preset
    const baseTarget = target.replace(/\[\*\]$/, '');
    if (!baseTarget) return [];

    const results: string[] = [];

    // 1. Navigate the output JSON sample to the base target array path
    results.push(...getItemProperties(outputJson, baseTarget));

    // 2. Mine existing top-level field mappings: e.g. "products[*].A" → "A"
    const arrayPrefix = `${baseTarget}[*].`;
    fieldMappings
      .map((fm) => fm.target)
      .filter((t) => t.startsWith(arrayPrefix))
      .map((t) => t.slice(arrayPrefix.length))
      .filter(Boolean)
      .forEach((t) => results.push(t));

    // 3. Mine ALL array mappings with the same base target (including current am)
    arrayMappings
      .filter((a) => a.target.replace(/\[\*\]$/, '') === baseTarget)
      .flatMap((a) => a.mappings.map((m) => m.target))
      .filter(Boolean)
      .forEach((t) => results.push(t));

    return [...new Set(results)];
  }, [outputJson, target, fieldMappings, arrayMappings]);

  useEffect(() => {
    if (am) {
      setSource(am.source);
      setTarget(am.target);
      setAlias(am.alias);
      setHasFilter(Boolean(am.filter));
      setFilterField(am.filter?.field ?? '');
      setFilterOp(am.filter?.operator ?? '!=');
      setFilterValue(String(am.filter?.value ?? ''));
      setPendingMappings([]);
    } else {
      setSource('');
      setTarget(newArrayPresetTarget);
      setAlias('item');
      setHasFilter(false);
      setFilterField('');
      setFilterOp('!=');
      setFilterValue('');
      setPendingMappings([]);
    }
    setOpenPanels({});
  }, [am, newArrayPresetTarget]);

  if (editingArrayId === null) return null;

  const isCreating = !am || editingArrayId === '__new__';

  const handleSave = () => {
    const filter = hasFilter && filterField
      ? { field: filterField, operator: filterOp, value: filterValue }
      : undefined;

    if (isCreating) {
      dispatch(
        addArrayMapping({
          source,
          target,
          alias: alias || 'item',
          filter,
          mappings: pendingMappings.map((m) => ({ ...m })),
        })
      );
    } else {
      dispatch(
        updateArrayMapping({
          id: am!.id,
          source,
          target,
          alias: alias || 'item',
          filter,
        })
      );
    }
    dispatch(openArrayModal({ id: null }));
  };

  const handleClose = () => dispatch(openArrayModal({ id: null }));

  return (
    <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">
              {isCreating ? 'New Array Mapping' : 'Edit Array Mapping'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure a loop over a source array with optional filters
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <HiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Source / Target / Alias */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Source Array Path
              </label>
              {sourceArrayPaths.length > 0 ? (
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="">— select array —</option>
                  {sourceArrayPaths.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                  placeholder="e.g. order.items"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Target Array Path
              </label>
              {targetArrayPaths.length > 0 ? (
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">— select array —</option>
                  {targetArrayPaths.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                  placeholder="e.g. products"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Loop Alias
              </label>
              <input
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                placeholder="item"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
          </div>

          {/* Filter */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasFilter}
                  onChange={(e) => setHasFilter(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-gray-700">Apply filter on array items</span>
              </label>
              {hasFilter && (
                <span className="text-xs text-gray-400">
                  e.g. only include items where{' '}
                  <code className="font-mono bg-white px-1 rounded border border-gray-200">
                    {alias}.{filterField || 'field'} {filterOp} {filterValue || 'value'}
                  </code>
                </span>
              )}
            </div>
            {hasFilter && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Field</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                    placeholder={`${alias}.status`}
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Operator</label>
                  <select
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                    value={filterOp}
                    onChange={(e) => setFilterOp(e.target.value as FilterOperator)}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Value</label>
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                    placeholder="10"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Field Mappings — always visible */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Field Mappings inside loop
              </span>
              <span className="text-xs text-gray-400">
                Use <code className="font-mono">{alias || 'item'}.fieldName</code> for source fields
              </span>
            </div>
            {isCreating && (
              <p className="text-xs text-blue-500 mb-2">
                Field mappings will be saved along with the array mapping.
              </p>
            )}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
              {(isCreating ? pendingMappings : (am?.mappings ?? [])).map((m) => {
                const panel = getPanel(m);
                const hasTransform = Boolean(m.transform);
                const hasEnum = Boolean(('valuesSetId' in m) && (m as any).valuesSetId);
                const hasFixed = ('fixedValue' in m) && (m as any).fixedValue !== undefined;

                const clearExtras = (except: 'transform' | 'enum' | 'fixed') => {
                  const patch: Record<string, undefined> = {};
                  if (except !== 'transform' && hasTransform) patch.transform = undefined;
                  if (except !== 'enum' && hasEnum) patch.valuesSetId = undefined;
                  if (except !== 'fixed' && hasFixed) patch.fixedValue = undefined;
                  if (Object.keys(patch).length === 0) return;
                  if (isCreating) {
                    setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, ...patch } : p));
                  } else {
                    am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, ...patch } }));
                  }
                };

                const openTransform = () => {
                  setOpenPanels((prev) => ({ ...prev, [m.id]: prev[m.id] === 'transform' ? null : 'transform' }));
                  clearExtras('transform');
                };

                const openEnum = () => {
                  setOpenPanels((prev) => ({ ...prev, [m.id]: prev[m.id] === 'enum' ? null : 'enum' }));
                  clearExtras('enum');
                };

                const openFixed = () => {
                  setOpenPanels((prev) => ({ ...prev, [m.id]: prev[m.id] === 'fixed' ? null : 'fixed' }));
                  clearExtras('fixed');
                };

                return (
                  <div key={m.id} className="rounded border border-gray-100 bg-gray-50 px-2 py-1.5 space-y-1">
                    {/* Row 1: source → target + toggle buttons + delete */}
                    <div className="flex items-center gap-1.5">
                      <input
                        list={`src-props-${m.id}`}
                        className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                        placeholder="source"
                        value={m.source}
                        onChange={(e) => {
                          if (isCreating) {
                            setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, source: e.target.value } : p));
                          } else {
                            am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, source: e.target.value } }));
                          }
                        }}
                      />
                      <datalist id={`src-props-${m.id}`}>
                        {sourceItemProps.map((prop) => <option key={prop} value={prop} />)}
                      </datalist>
                      <span className="text-gray-300 flex-shrink-0 text-xs select-none">→</span>
                      <input
                        list={`tgt-props-${m.id}`}
                        className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                        placeholder="target"
                        value={m.target}
                        onChange={(e) => {
                          if (isCreating) {
                            setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, target: e.target.value } : p));
                          } else {
                            am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, target: e.target.value } }));
                          }
                        }}
                      />
                      <datalist id={`tgt-props-${m.id}`}>
                        {[
                          ...new Set([
                            ...targetItemProps,
                            ...(isCreating ? pendingMappings : (am?.mappings ?? []))
                              .filter((p) => p.id !== m.id)
                              .map((p) => p.target)
                              .filter(Boolean),
                          ]),
                        ].map((prop) => <option key={prop} value={prop} />)}
                      </datalist>
                      {/* ƒ toggle */}
                      <button
                        title={hasTransform ? `Expression: ${m.transform}` : 'Add expression transform'}
                        onClick={openTransform}
                        className={[
                          'flex-shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded border transition leading-none',
                          panel === 'transform'
                            ? 'bg-violet-100 border-violet-300 text-violet-700'
                            : hasTransform
                            ? 'bg-violet-50 border-violet-200 text-violet-400'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
                        ].join(' ')}
                      >ƒ</button>
                      {/* ≡ toggle */}
                      <button
                        title={hasEnum ? `Enum: ${valuesSets.find((s) => s.id === (m as any).valuesSetId)?.name ?? (m as any).valuesSetId}` : 'Add enum / values-set lookup'}
                        onClick={openEnum}
                        className={[
                          'flex-shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded border transition leading-none',
                          panel === 'enum'
                            ? 'bg-violet-100 border-violet-300 text-violet-700'
                            : hasEnum
                            ? 'bg-violet-50 border-violet-200 text-violet-400'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
                        ].join(' ')}
                      >≡</button>
                      {/* " fixed-value toggle */}
                      <button
                        title={hasFixed ? `Fixed: "${(m as any).fixedValue}"` : 'Set fixed value'}
                        onClick={openFixed}
                        className={[
                          'flex-shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded border transition leading-none',
                          panel === 'fixed'
                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                            : hasFixed
                            ? 'bg-orange-50 border-orange-200 text-orange-400'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500',
                        ].join(' ')}
                      >"</button>
                      {/* delete */}
                      <button
                        className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
                        onClick={() => {
                          if (isCreating) {
                            setPendingMappings((prev) => prev.filter((p) => p.id !== m.id));
                          } else {
                            am && dispatch(removeArrayFieldMapping({ arrayId: am.id, mappingId: m.id }));
                          }
                          setOpenPanels((prev) => { const next = { ...prev }; delete next[m.id]; return next; });
                        }}
                      >
                        <HiOutlineTrash size={13} />
                      </button>
                    </div>

                    {/* Secondary row — only when panel is open */}
                    {panel === 'transform' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-violet-400 font-mono flex-shrink-0 w-4 text-center select-none">ƒ</span>
                        <input
                          autoFocus
                          className="flex-1 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300 text-violet-700"
                          placeholder="e.g. value * 1.1  — 'value' = source field"
                          value={m.transform ?? ''}
                          onChange={(e) => {
                            if (isCreating) {
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, transform: e.target.value || undefined } : p));
                            } else {
                              am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, transform: e.target.value || undefined } }));
                            }
                          }}
                        />
                      </div>
                    )}

                    {panel === 'enum' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-violet-400 font-mono flex-shrink-0 w-4 text-center select-none">≡</span>
                        <select
                          className="flex-1 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                          value={('valuesSetId' in m ? (m as any).valuesSetId : undefined) ?? ''}
                          onChange={(e) => {
                            const val = e.target.value || undefined;
                            if (isCreating) {
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, valuesSetId: val } : p));
                            } else {
                              am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, valuesSetId: val } }));
                            }
                          }}
                        >
                          <option value="">— pick values set —</option>
                          {valuesSets.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {panel === 'fixed' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-orange-400 font-mono flex-shrink-0 w-4 text-center select-none">"</span>
                        <input
                          autoFocus
                          className="flex-1 border border-orange-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-orange-400 placeholder-gray-300 text-orange-700"
                          placeholder="fixed constant value"
                          value={('fixedValue' in m ? (m as any).fixedValue : undefined) ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isCreating) {
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, fixedValue: val, source: '' } : p));
                            } else {
                              am && dispatch(updateArrayFieldMapping({ arrayId: am.id, mapping: { id: m.id, fixedValue: val, source: '' } }));
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
              <button
                className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition"
                onClick={() => {
                  if (isCreating) {
                    setPendingMappings((prev) => [...prev, { id: `pending-${Date.now()}`, source: '', target: '' }]);
                  } else {
                    am && dispatch(addArrayFieldMapping({ arrayId: am.id, mapping: { source: '', target: '' } }));
                  }
                }}
              >
                <HiPlusCircle size={13} /> Add field mapping
              </button>
          </div>

          {/* Example preview */}
          {source && target && (
            <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-x-auto">
              <pre className="whitespace-pre leading-5">
                {generateExample(source, target, alias, hasFilter, filterField, filterOp, filterValue)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {!isCreating && (
            <button
              className="text-xs text-rose-500 hover:text-rose-700 transition"
              onClick={() => {
                dispatch(removeArrayMapping(am!.id));
                handleClose();
              }}
            >
              Delete array mapping
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleClose}
              className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!source || !target}
              className="text-xs bg-blue-600 text-white rounded px-4 py-1.5 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectArrayPaths(obj: any, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return collectArrayPaths(v, path);
  });
}

/** Navigate a dot-separated path in an object, returning the value at that path. */
function navigatePath(obj: any, path: string): any {
  if (!path) return obj;
  return path.split('.').reduce((cur, key) => (cur != null && typeof cur === 'object' ? cur[key] : undefined), obj);
}

/** Get the flat leaf-property names of items inside an array at `arrayPath`. */
function getItemProperties(jsonStr: string, arrayPath: string): string[] {
  try {
    const root = JSON.parse(jsonStr);
    // First try: direct navigation to the path
    const arr = navigatePath(root, arrayPath);
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      if (first && typeof first === 'object' && !Array.isArray(first)) {
        return flattenObjectKeys(first);
      }
    }
    // Second try: scan ALL leaf paths in the JSON and filter to those under arrayPath
    // This handles cases where the path traversal goes through intermediate arrays
    const allPaths = getAllLeafPaths(root);
    const prefix = `${arrayPath}.`;
    const nested = allPaths
      .filter((p) => p.startsWith(prefix))
      .map((p) => p.slice(prefix.length))
      .filter((p) => p.length > 0 && !p.includes('.'));
    return [...new Set(nested)];
  } catch {
    return [];
  }
}

/**
 * Collect all leaf paths in an object, traversing through arrays by using the first element.
 * E.g. {a: {b: [{c: 1}]}} → ['a.b.c']
 */
function getAllLeafPaths(obj: any, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return prefix ? [prefix] : [];
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [];
    return getAllLeafPaths(obj[0], prefix);
  }
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return getAllLeafPaths(v, path);
  });
}

/** Recursively flatten object keys using dot notation. */
function flattenObjectKeys(obj: any, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return prefix ? [prefix] : [];
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return [path, ...flattenObjectKeys(v, path)];
    }
    return [path];
  });
}

function generateExample(
  source: string,
  target: string,
  alias: string,
  hasFilter: boolean,
  filterField: string,
  filterOp: string,
  filterValue: string
): string {
  const lines = [`"${target}": [`];
  lines.push(`  {{- for ${alias} in ${source} -}}`);
  if (hasFilter && filterField) {
    lines.push(`  {{- if ${alias}.${filterField} ${filterOp} ${filterValue} -}}`);
  }
  lines.push('  {');
  lines.push('    // ... field mappings ...');
  lines.push('  },');
  if (hasFilter && filterField) lines.push('  {{- end -}}');
  lines.push('  {{- end -}}');
  lines.push(']');
  return lines.join('\n');
}

export default ArrayMappingModal;
