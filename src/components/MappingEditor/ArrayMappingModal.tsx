import React, { useEffect, useState } from 'react';
import { HiOutlineTrash, HiPlusCircle, HiX } from 'react-icons/hi';
import {
  useMappingEditorDispatch,
  useMappingEditorState,
  addArrayMapping,
  openArrayModal,
  removeArrayMapping,
  updateArrayMapping,
} from './MappingEditorContext';
import { ArrayMapping, FilterOperator, LookupDictionary, LookupEntry, genId } from './types';
import { buildTypeMap } from 'src/utils/scribanGenerator';
import { getFullSourcePath, getFullTargetBase, getItemArrayPaths, collectArrayPaths, getItemProperties, generateExample } from './arrayMappingHelpers';
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
  const dispatch = useMappingEditorDispatch();
  const { editingArrayId, arrayMappings, fieldMappings, inputJson, outputJson, newArrayPresetTarget, newArrayParentId, partnerAdapterProperties, selectedPartnerId } = useMappingEditorState();
  const { data: globalSetsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });
  const allGlobalSets = globalSetsData?.result ?? [];

  const am = arrayMappings.find((m) => m.id === editingArrayId);
  const parentAm = newArrayParentId ? arrayMappings.find((m) => m.id === newArrayParentId) : undefined;

  // Full source path for the parent AM (e.g. 'orders' for L1, 'orders.items' for L2 items' parent)
  const parentFullSource = React.useMemo(() => {
    if (!parentAm) return '';
    return getFullSourcePath(parentAm.id, arrayMappings);
  }, [parentAm, arrayMappings]);

  // Source array options depend on whether this is a nested modal or top-level
  const sourceArrayPaths: string[] = React.useMemo(() => {
    try {
      const obj = JSON.parse(inputJson);
      if (parentAm) {
        // For nested: sub-arrays of the parent array's items
        return getItemArrayPaths(obj, parentFullSource);
      }
      return collectArrayPaths(obj);
    } catch {
      return [];
    }
  }, [inputJson, parentAm, parentFullSource]);

  // Local editable state (synced from Redux on open)
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [alias, setAlias] = useState('item');
  const [hasFilter, setHasFilter] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [filterOp, setFilterOp] = useState<FilterOperator>('!=');
  const [filterValue, setFilterValue] = useState('');
const [pendingMappings, setPendingMappings] = useState<Array<{
    id: string; source: string; target: string;
    transform?: string; fixedValue?: string;
    lookupDictionary?: LookupDictionary;
    isRootSource?: boolean;
    partnerPropKey?: string;
    globalSetId?: string;
    globalKey?: string;
  }>>([]);
  // Which secondary panel is open for each mapping row: 'transform' | 'lookup' | 'fixed' | null
  const [openPanels, setOpenPanels] = useState<Record<string, 'transform' | 'lookup' | 'fixed' | null>>({});

  // Derive which secondary panel should be shown for a given row (data-driven fallback)
  const getPanel = (m: { id: string; transform?: string; fixedValue?: string; lookupDictionary?: LookupDictionary }): 'transform' | 'lookup' | 'fixed' | null => {
    if (m.id in openPanels) return openPanels[m.id];
    if (m.fixedValue !== undefined) return 'fixed';
    if ((m.lookupDictionary?.entries?.length ?? 0) > 0) return 'lookup';
    if (m.transform) return 'transform';
    return null;
  };

  // Flat scalar leaf paths from the root input JSON (for fixed-item value suggestions).
  // Stops at any array-valued key — only paths through plain objects are included.
  const inputScalarProps = React.useMemo(() => {
    try {
      const root = JSON.parse(inputJson);
      const collect = (obj: any, prefix: string): string[] => {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
          return prefix ? [prefix] : [];
        }
        return Object.entries(obj).flatMap(([k, v]) => {
          const path = prefix ? `${prefix}.${k}` : k;
          if (Array.isArray(v)) return []; // stop — don't traverse into arrays
          if (v && typeof v === 'object') return collect(v, path);
          return [path];
        });
      };
      return collect(root, '');
    } catch {
      return [];
    }
  }, [inputJson]);

  // Dropdown suggestions for source item fields (relative names from array items, excluding arrays)
  const fullSourcePath = React.useMemo(() => {
    if (!source) return '';
    return parentFullSource ? `${parentFullSource}.${source}` : source;
  }, [source, parentFullSource]);
  const sourceItemProps = React.useMemo(() => getItemProperties(inputJson, fullSourcePath), [inputJson, fullSourcePath]);

  // Child array mappings of the currently edited AM (shown as read-only)
  const childArrayMappings = React.useMemo(
    () => (am ? arrayMappings.filter((c) => c.parentArrayId === am.id) : []),
    [am, arrayMappings]
  );

  // Used targets (to exclude from target field dropdown suggestions)
  const usedTargets = React.useMemo(() => {
    return new Set(pendingMappings.map((m) => m.target).filter(Boolean));
  }, [pendingMappings]);

  // Dropdown suggestions for target item fields (from outputJson at target path)
  const fullTargetBase = React.useMemo(() => {
    if (!target) return '';
    if (!newArrayParentId) return target;
    const parentBase = getFullTargetBase(newArrayParentId, arrayMappings);
    return parentBase ? `${parentBase}.${target}` : target;
  }, [target, newArrayParentId, arrayMappings]);

  const targetItemProps = React.useMemo(() => {
    const baseTarget = fullTargetBase;
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

    // 3. Mine AM mappings with the same target (scoped by parentArrayId for nested)
    arrayMappings
      .filter((a) => a.target.replace(/\[\*\]$/, '') === target && a.parentArrayId === (newArrayParentId ?? undefined))
      .flatMap((a) => a.mappings.map((m) => m.target))
      .filter(Boolean)
      .forEach((t) => results.push(t));

    return [...new Set(results)];
  }, [outputJson, fullTargetBase, target, newArrayParentId, fieldMappings, arrayMappings]);

  // TypeMap for the output JSON — used to constrain lookup output values
  const outputTypeMap = React.useMemo(() => {
    try { return buildTypeMap(outputJson); } catch { return {}; }
  }, [outputJson]);

  useEffect(() => {
    if (am) {
      setSource(am.source);
      setTarget(am.target);
      setAlias(am.alias);
      setHasFilter(Boolean(am.filter));
      setFilterField(am.filter?.field ?? '');
      setFilterOp(am.filter?.operator ?? '!=');
      setFilterValue(String(am.filter?.value ?? ''));
      // Pre-populate local pending mappings; auto-detect isRootSource for old data
      // that was saved before the flag existed.
      const scalarSet = new Set(inputScalarProps);
      setPendingMappings(am.mappings.map((m) => ({
        ...m,
        isRootSource: m.isRootSource ?? ((Boolean(m.source) && scalarSet.has(m.source)) || undefined),
      })));
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
  }, [am, newArrayPresetTarget, inputScalarProps]);

  if (editingArrayId === null) return null;

  const isCreating = !am || editingArrayId === '__new__';
  const isNested = Boolean(newArrayParentId);

  const handleSave = () => {
    const filter = hasFilter && filterField
      ? { field: filterField, operator: filterOp, value: filterValue }
      : undefined;

    // Strip lookupDictionary when it has no valid entries (both from and to must be filled)
    const cleanMappings = (maps: typeof pendingMappings) => maps.map((m) => {
      const hasValidEntries = (m.lookupDictionary?.entries ?? []).some(e => e.from.trim() !== '' && e.to.trim() !== '');
      return hasValidEntries ? { ...m } : { ...m, lookupDictionary: undefined };
    });

    if (isCreating) {
      dispatch(
        addArrayMapping({
          source,
          target,
          alias: alias || 'item',
          filter,
          mappings: cleanMappings(pendingMappings),
          parentArrayId: newArrayParentId ?? undefined,
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
          mappings: cleanMappings(pendingMappings),
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
              {isNested && (
                <span className="ml-2 text-[10px] font-normal bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">
                  nested inside {parentAm?.target ?? ''}
                </span>
              )}
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
                Target Array Path
              </label>
              <input
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono bg-gray-50 text-gray-500 cursor-not-allowed"
                value={target}
                readOnly
                disabled
                title="Target is determined by the array you clicked in the output tree"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Source Array Path
              </label>
              {sourceArrayPaths.length > 0 ? (
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                  value={source}
                  onChange={(e) => { setSource(e.target.value); setPendingMappings([]); setOpenPanels({}); }}
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
                  onChange={(e) => { setSource(e.target.value); setPendingMappings([]); setOpenPanels({}); }}
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
                    placeholder="status"
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
              {pendingMappings.map((m) => {
                const panel = getPanel(m);
                const hasTransform = Boolean(m.transform);
                const hasLookup = (m.lookupDictionary?.entries?.length ?? 0) > 0;
                const hasFixed = m.fixedValue !== undefined;

                // Type of this specific target field from outputJson
                const targetFieldType = m.target && fullTargetBase
                  ? outputTypeMap[`${fullTargetBase}[*].${m.target}`]
                  : undefined;

                const openTransform = () => {
                  setOpenPanels((prev) => ({ ...prev, [m.id]: prev[m.id] === 'transform' ? null : 'transform' }));
                  // clear lookup when switching to transform
                  if (hasLookup) setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, lookupDictionary: undefined } : p));
                };

                const openLookup = () => {
                  const isOpen = openPanels[m.id] === 'lookup';
                  if (!isOpen) {
                    // clear transform when opening lookup
                    if (hasTransform) setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, transform: undefined } : p));
                  } else {
                    // closing — clear dict if no valid entries (both from and to filled)
                    const entries = m.lookupDictionary?.entries ?? [];
                    const hasValid = entries.some(e => e.from.trim() !== '' && e.to.trim() !== '');
                    if (!hasValid) {
                      setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, lookupDictionary: undefined } : p));
                    }
                  }
                  setOpenPanels((prev) => ({ ...prev, [m.id]: isOpen ? null : 'lookup' }));
                };

                const rowMode = m.partnerPropKey !== undefined ? 'partner' : m.globalSetId !== undefined ? 'global' : hasFixed ? 'fixed' : 'source';

                return (
                  <div key={m.id} className="rounded border border-gray-100 bg-white px-2 py-1.5 space-y-1">
                    {/* Row: target ← [src|≡|"] source-selector [ƒ] [trash] */}
                    <div className="flex items-center gap-1">
                      {/* mapped indicator dot */}
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.source || hasFixed || m.partnerPropKey || (m.globalSetId && m.globalKey) ? 'bg-emerald-400' : 'bg-rose-300'}`} />

                      {/* target field — dropdown if known, otherwise free-text */}
                      {targetItemProps.length > 0 ? (
                        <select
                          className="font-mono text-xs text-gray-700 bg-transparent border-0 focus:outline-none min-w-0 max-w-[7rem] truncate"
                          value={m.target}
                          onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, target: e.target.value } : p))}
                        >
                          <option value="">— target —</option>
                          {[...new Set([...targetItemProps, m.target].filter(Boolean))]
                            .filter((prop) => !usedTargets.has(prop) || prop === m.target)
                            .map((prop) => <option key={prop} value={prop}>{prop}</option>)}
                        </select>
                      ) : (
                        <input
                          className="font-mono text-xs text-gray-700 bg-transparent border-0 focus:outline-none min-w-0 w-24"
                          placeholder="target"
                          value={m.target}
                          onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, target: e.target.value } : p))}
                        />
                      )}

                      <span className="text-gray-300 flex-shrink-0 text-xs select-none">←</span>

                      {/* Source / Fixed / Partner / Global mode toggle */}
                      <div className={`flex flex-shrink-0 rounded overflow-hidden border text-[10px] font-medium ${!m.target ? 'opacity-30 pointer-events-none border-gray-200' : 'border-gray-200'}`}>
                        <button
                          disabled={!m.target}
                          onClick={() => {
                            if (rowMode !== 'source') {
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, fixedValue: undefined, partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined } : p));
                              setOpenPanels((prev) => ({ ...prev, [m.id]: null }));
                            }
                          }}
                          className={rowMode === 'source' ? 'px-1.5 py-0.5 bg-blue-500 text-white' : 'px-1.5 py-0.5 text-gray-400 hover:bg-gray-50'}
                        >Source</button>
                        <button
                          disabled={!m.target}
                          onClick={() => {
                            if (rowMode !== 'fixed') {
                              setOpenPanels((prev) => ({ ...prev, [m.id]: null }));
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, source: '', fixedValue: '', partnerPropKey: undefined, globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined } : p));
                            }
                          }}
                          className={rowMode === 'fixed' ? 'px-1.5 py-0.5 bg-amber-500 text-white border-l border-amber-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                        >Fixed</button>
                          <button
                            disabled={!m.target}
                            onClick={() => {
                              if (rowMode !== 'partner') {
                                setOpenPanels((prev) => ({ ...prev, [m.id]: null }));
                                setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, source: '', fixedValue: undefined, partnerPropKey: '', globalSetId: undefined, globalKey: undefined, lookupDictionary: undefined, transform: undefined } : p));
                              }
                            }}
                            className={rowMode === 'partner' ? 'px-1.5 py-0.5 bg-emerald-500 text-white border-l border-emerald-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                          >Partner</button>
                        <button
                          disabled={!m.target}
                          onClick={() => {
                            if (rowMode !== 'global') {
                              setOpenPanels((prev) => ({ ...prev, [m.id]: null }));
                              setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, source: '', fixedValue: undefined, partnerPropKey: undefined, globalSetId: '', globalKey: '', lookupDictionary: undefined, transform: undefined } : p));
                            }
                          }}
                          className={rowMode === 'global' ? 'px-1.5 py-0.5 bg-teal-500 text-white border-l border-teal-400' : 'px-1.5 py-0.5 text-gray-400 border-l border-gray-200 hover:bg-gray-50'}
                        >Global</button>
                      </div>

                      {/* Lookup button — only in source mode */}
                      {rowMode === 'source' && <button
                        disabled={!m.source}
                        title={!m.source ? 'Select a source field first' : hasLookup ? `Lookup: ${m.lookupDictionary!.entries.length} entries` : 'Map source values to different output values'}
                        onClick={openLookup}
                        className={[
                          'flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border transition leading-none',
                          !m.source ? 'opacity-30 cursor-not-allowed bg-white border-gray-200 text-gray-400'
                            : hasLookup ? 'bg-violet-100 border-violet-300 text-violet-700'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
                        ].join(' ')}
                      >Lookup</button>}

                      {/* source selector, fixed input, partner input, or global pickers */}
                      {rowMode === 'fixed' ? (
                        targetFieldType === 'boolean' ? (
                          <select
                            className="flex-1 min-w-0 border-0 bg-transparent font-mono text-xs text-amber-600 focus:outline-none"
                            value={m.fixedValue ?? ''}
                            onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, fixedValue: e.target.value, source: '' } : p))}
                          >
                            <option value="">— pick —</option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : (
                          <input
                            className="flex-1 min-w-0 border-0 bg-transparent font-mono text-xs text-amber-600 focus:outline-none placeholder-amber-300"
                            placeholder={targetFieldType === 'number' ? '0' : 'fixed value…'}
                            type={targetFieldType === 'number' ? 'number' : 'text'}
                            value={m.fixedValue ?? ''}
                            onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, fixedValue: e.target.value, source: '' } : p))}
                          />
                        )
                      ) : rowMode === 'partner' ? (
                        <div className="flex-1 relative min-w-0">
                          <input
                            list={`partner-props-am-${m.id}`}
                            className="w-full border-0 bg-transparent font-mono text-xs focus:outline-none text-emerald-600 placeholder-emerald-300"
                            placeholder="property key…"
                            value={m.partnerPropKey ?? ''}
                            onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, partnerPropKey: e.target.value } : p))}
                          />
                          <datalist id={`partner-props-am-${m.id}`}>
                            {Object.keys(partnerAdapterProperties).map((k) => (
                              <option key={k} value={k} />
                            ))}
                          </datalist>
                        </div>
                      ) : rowMode === 'global' ? (
                        <div className="flex gap-1 flex-1 min-w-0">
                          <select
                            className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-600 flex-1 min-w-0"
                            value={m.globalSetId ?? ''}
                            onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, globalSetId: e.target.value, globalKey: '' } : p))}
                          >
                            <option value="">— pick set —</option>
                            {allGlobalSets.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          {m.globalSetId && (
                            <select
                              className="border-0 bg-transparent font-mono text-xs focus:outline-none text-teal-500 flex-1 min-w-0"
                              value={m.globalKey ?? ''}
                              onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, globalKey: e.target.value } : p))}
                            >
                              <option value="">— pick key —</option>
                              {Object.keys(allGlobalSets.find((s) => s.id === m.globalSetId)?.values ?? {}).map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <select
                          disabled={!m.target}
                          className={`flex-1 min-w-0 border-0 bg-transparent font-mono text-xs focus:outline-none ${
                            !m.target ? 'opacity-30 cursor-not-allowed text-gray-400' : 'text-gray-500'
                          }`}
                          value={m.source}
                          onChange={(e) => {
                            const val = e.target.value;
                            const isRoot = inputScalarProps.includes(val);
                            setPendingMappings((prev) => prev.map((p) =>
                              p.id === m.id
                                ? { ...p, source: val, fixedValue: undefined, lookupDictionary: undefined, isRootSource: isRoot || undefined }
                                : p
                            ));
                          }}
                        >
                          <option value="">— unassigned —</option>
                          {sourceItemProps.length > 0 && (
                            <optgroup label={`${alias} fields`}>
                              {sourceItemProps.map((prop) => (
                                <option key={prop} value={prop}>{prop}</option>
                              ))}
                            </optgroup>
                          )}
                          {inputScalarProps.length > 0 && (
                            <optgroup label="root fields">
                              {inputScalarProps.map((prop) => (
                                <option key={prop} value={prop}>{prop}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      )}

                      {/* Transform toggle — only in source mode with a source selected and no lookup */}
                      {rowMode === 'source' && Boolean(m.source) && !hasLookup && <button
                        title={hasTransform ? `Transform: ${m.transform}` : 'Add a transform expression to modify the value'}
                        onClick={openTransform}
                        className={[
                          'flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border transition leading-none',
                          panel === 'transform'
                            ? 'bg-violet-100 border-violet-300 text-violet-700'
                            : hasTransform
                            ? 'bg-violet-50 border-violet-200 text-violet-500'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500',
                        ].join(' ')}
                      >Transform</button>}

                      {/* delete */}
                      <button
                        className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
                        onClick={() => {
                          setPendingMappings((prev) => prev.filter((p) => p.id !== m.id));
                          setOpenPanels((prev) => { const next = { ...prev }; delete next[m.id]; return next; });
                        }}
                      >
                        <HiOutlineTrash size={13} />
                      </button>
                    </div>

                    {/* Secondary row — only when panel is open */}
                    {panel === 'transform' && (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-medium text-violet-600 select-none">Transform <span className="font-normal text-gray-400">(optional — modify the value before output. Use <code className="font-mono">value</code> to refer to the source field.)</span></span>
                        <input
                          autoFocus
                          className="w-full border border-violet-200 bg-white rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300 text-violet-700"
                          placeholder="e.g.  value * 1.1    or    value + ' USD'"
                          value={m.transform ?? ''}
                          onChange={(e) => {
                            setPendingMappings((prev) => prev.map((p) => p.id === m.id ? { ...p, transform: e.target.value || undefined } : p));
                          }}
                        />
                      </div>
                    )}

                    {/* Lookup dictionary panel */}
                    {panel === 'lookup' && (
                      <div className="mt-0.5 rounded-lg border border-violet-200 bg-violet-50 p-2 space-y-1.5">
                        {/* Entry rows */}
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {(m.lookupDictionary?.entries ?? []).length === 0 && (
                            <p className="text-[10px] text-violet-400 italic px-1">No entries yet — add one below.</p>
                          )}
                          {(m.lookupDictionary?.entries ?? []).map((entry: LookupEntry, idx: number) => (
                            <div key={idx} className="flex items-center gap-1">
                              <input
                                autoFocus={idx === 0}
                                className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
                                placeholder="source value"
                                value={entry.from}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                    ...p,
                                    lookupDictionary: {
                                      ...p.lookupDictionary!,
                                      entries: p.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, from: val } : ee),
                                    },
                                  }));
                                }}
                              />
                              <span className="text-gray-300 text-[10px] flex-shrink-0 select-none">→</span>
                              {/* output value — type-constrained by targetFieldType */}
                              {targetFieldType === 'boolean' ? (
                                <select
                                  className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                                  value={entry.to}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                      ...p,
                                      lookupDictionary: {
                                        ...p.lookupDictionary!,
                                        entries: p.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, to: val } : ee),
                                      },
                                    }));
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
                                    setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                      ...p,
                                      lookupDictionary: {
                                        ...p.lookupDictionary!,
                                        entries: p.lookupDictionary!.entries.map((ee, i) => i === idx ? { ...ee, to: val } : ee),
                                      },
                                    }));
                                  }}
                                />
                              )}
                              <button
                                className="flex-shrink-0 text-gray-300 hover:text-rose-400 transition"
                                onClick={() => setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                  ...p,
                                  lookupDictionary: { ...p.lookupDictionary!, entries: p.lookupDictionary!.entries.filter((_, i) => i !== idx) },
                                }))}
                              >
                                <HiOutlineTrash size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {/* Add entry */}
                        <button
                          className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 transition font-medium"
                          onClick={() => setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                            ...p,
                            lookupDictionary: {
                              ...p.lookupDictionary ?? { fallback: 'null' as const },
                              entries: [...(p.lookupDictionary?.entries ?? []), { from: '', to: '' }],
                            },
                          }))}
                        >
                          <HiPlusCircle size={11} /> Add entry
                        </button>
                        {/* Fallback — only shown once at least one entry exists */}
                        {(m.lookupDictionary?.entries?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-2 pt-1 border-t border-violet-200">
                          <span className="text-[10px] text-gray-500 flex-shrink-0 select-none">If not found:</span>
                          <select
                            className="text-xs border border-violet-200 bg-white rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                            value={m.lookupDictionary?.fallback ?? 'null'}
                            onChange={(e) => {
                              const val = e.target.value as LookupDictionary['fallback'];
                              setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                ...p,
                                lookupDictionary: { ...p.lookupDictionary!, fallback: val },
                              }));
                            }}
                          >
                            <option value="null">output null</option>
                            <option value="custom">use custom fallback</option>
                          </select>
                          {m.lookupDictionary?.fallback === 'custom' && (
                            targetFieldType === 'boolean' ? (
                              <select
                                className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                                value={m.lookupDictionary.fallbackValue ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                    ...p, lookupDictionary: { ...p.lookupDictionary!, fallbackValue: val },
                                  }));
                                }}
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
                                value={m.lookupDictionary.fallbackValue ?? ''}
                                onChange={(e) => setPendingMappings((prev) => prev.map((p) => p.id !== m.id ? p : {
                                  ...p,
                                  lookupDictionary: { ...p.lookupDictionary!, fallbackValue: e.target.value },
                                }))}
                              />
                            )
                          )}
                        </div>
                        )}
                      </div>
                    )}


                  </div>
                );
              })}
              </div>
              <button
                disabled={!source}
                className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                onClick={() => {
                  setPendingMappings((prev) => [...prev, { id: `pending-${Date.now()}`, source: '', target: '' }]);
                }}
              >
                <HiPlusCircle size={13} /> Add field mapping
              </button>
          </div>

          {/* Child Array Mappings — read-only, shown when editing an existing mapping */}
          {!isCreating && childArrayMappings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-700">Nested Array Mappings</span>
                <span className="text-xs text-gray-400">configured via their own loop buttons</span>
              </div>
              <div className="space-y-1.5">
                {childArrayMappings.map((child) => (
                  <div key={child.id} className="rounded border border-amber-100 bg-amber-50 px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5">loop</span>
                      <span className="text-xs font-mono text-gray-700">
                        {child.source} <span className="text-gray-400">{'→'}</span> {child.target}
                        <span className="text-gray-400 ml-1">as {child.alias}</span>
                      </span>
                      {child.filter && (
                        <span className="text-[10px] text-gray-500 font-mono border border-gray-200 rounded px-1 bg-white">
                          if {child.alias}.{child.filter.field} {child.filter.operator} {child.filter.value}
                        </span>
                      )}
                    </div>
                    {child.mappings.length > 0 && (
                      <div className="space-y-0.5 pl-2 border-l border-amber-200">
                        {child.mappings.map((m) => (
                          <div key={m.id} className="text-[10px] font-mono text-gray-500">
                            {m.source || (m.fixedValue !== undefined ? `"${m.fixedValue}"` : '—')}
                            {' '}<span className="text-gray-300">{'→'}</span>{' '}
                            {m.target}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
              disabled={
                !target ||
                (hasFilter && !source) ||
                pendingMappings.some(
                  (m) => m.target && !m.source && m.fixedValue === undefined && !m.lookupDictionary && !m.partnerPropKey && !(m.globalSetId && m.globalKey)
                )
              }
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

export default ArrayMappingModal;
