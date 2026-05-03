import React from 'react';
import { HiPlusCircle, HiX } from 'react-icons/hi';
import { useMappingEditorDispatch, useMappingEditorState } from '../context/MappingEditorContext';
import { FilterOperator } from 'src/types/mapping';
import { generateExample } from 'src/utils/arrayMappingHelpers';
import { useArrayMappingModal } from './useArrayMappingModal';
import { ArrayMappingFieldRow } from './ArrayMappingFieldRow';

// ─── Operators ────────────────────────────────────────────────────────────────

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
  const { editingArrayId } = useMappingEditorState();

  const {
    isCreating,
    isNested,
    parentAmTarget,
    source,
    target,
    alias,
    hasFilter,
    filterField,
    filterOp,
    filterValue,
    pendingMappings,
    openPanels,
    sourceArrayPaths,
    sourceItemProps,
    targetItemProps,
    inputScalarProps,
    outputTypeMap,
    usedTargets,
    childArrayMappings,
    allGlobalSets,
    partnerAdapterProperties,
    setSource,
    setAlias,
    setHasFilter,
    setFilterField,
    setFilterOp,
    setFilterValue,
    setOpenPanels,
    handleSave,
    handleClose,
    handleDelete,
    addFieldRow,
    removeFieldRow,
    patchFieldRow,
    getPanel,
  } = useArrayMappingModal();

  if (editingArrayId === null) return null;

  const fullTargetBase = target;

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
                  nested inside {parentAmTarget}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Configure a loop over a source array with optional filters</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <HiX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Source / Target / Alias */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Array Path</label>
              <input
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono bg-gray-50 text-gray-500 cursor-not-allowed"
                value={target}
                readOnly
                disabled
                title="Target is determined by the array you clicked in the output tree"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source Array Path</label>
              {sourceArrayPaths.length > 0 ? (
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400 bg-white"
                  value={source}
                  onChange={(e) => { setSource(e.target.value); }}
                >
                  <option value="">— select array —</option>
                  {sourceArrayPaths.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                  placeholder="e.g. order.items"
                  value={source}
                  onChange={(e) => { setSource(e.target.value); }}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Loop Alias</label>
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
                    {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
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

          {/* Field Mappings */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-700">Field Mappings inside loop</span>
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
                const targetFieldType = m.target && fullTargetBase
                  ? outputTypeMap[`${fullTargetBase}[*].${m.target}`]
                  : undefined;

                return (
                  <ArrayMappingFieldRow
                    key={m.id}
                    m={m}
                    alias={alias}
                    panel={getPanel(m)}
                    targetFieldType={targetFieldType}
                    targetItemProps={targetItemProps}
                    usedTargets={usedTargets}
                    sourceItemProps={sourceItemProps}
                    inputScalarProps={inputScalarProps}
                    partnerAdapterProperties={partnerAdapterProperties}
                    allGlobalSets={allGlobalSets}
                    onPatch={(patch) => patchFieldRow(m.id, patch)}
                    onRemove={() => removeFieldRow(m.id)}
                    onOpenPanel={(panel) => setOpenPanels((prev) => ({ ...prev, [m.id]: panel }))}
                  />
                );
              })}
            </div>
            <button
              disabled={!source}
              className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
              onClick={addFieldRow}
            >
              <HiPlusCircle size={13} /> Add field mapping
            </button>
          </div>

          {/* Child Array Mappings — read-only */}
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
            <button className="text-xs text-rose-500 hover:text-rose-700 transition" onClick={handleDelete}>
              Delete array mapping
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleClose} className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition">
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
