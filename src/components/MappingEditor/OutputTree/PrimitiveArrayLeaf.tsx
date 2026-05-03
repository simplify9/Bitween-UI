import React from 'react';
import { TreeNode } from 'src/utils/mappingPreview';
import { MappingMode, PrimitiveArrayItem } from 'src/types/mapping';
import { ModeToggleButtons } from '../ModeToggleButtons';
import { LeafValueInput } from '../LeafValueInput';
import { GlobalAdapterValuesSetModel } from 'src/types/globalAdapterValuesSets';
import { MODE_INITIAL_FIELDS } from 'src/utils/mappingModeDefaults';
import { usePrimitiveArrayLeaf } from './usePrimitiveArrayLeaf';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrimitiveArrayLeafProps {
  node: TreeNode;
  sourcePaths: string[];
  primitiveArrayValues: unknown[];
  primAmId: string | undefined;
  currentItems: PrimitiveArrayItem[];
  partnerAdapterProperties: Record<string, string>;
  allGlobalSets: GlobalAdapterValuesSetModel[];
  onLeafRef?: (path: string, el: HTMLElement | null) => void;
  isSearchMatch?: boolean;
}

// ─── PrimitiveArrayLeaf ───────────────────────────────────────────────────────
// Handles a target field that is a primitive (string/number) array.
// Each index is mapped individually.

export const PrimitiveArrayLeaf: React.FC<PrimitiveArrayLeafProps> = ({
  node,
  sourcePaths,
  primitiveArrayValues,
  primAmId,
  currentItems,
  partnerAdapterProperties,
  allGlobalSets,
  onLeafRef,
  isSearchMatch,
}) => {
  const { panelOpen, setPanelOpen, ref, mappedCount, saveItem, onMapEmptyArray, onClearEmptyArray } =
    usePrimitiveArrayLeaf(node, primAmId, currentItems, onLeafRef);

  const firstVal = primitiveArrayValues[0];
  const itemType: 'string' | 'number' | 'boolean' | undefined =
    typeof firstVal === 'number' ? 'number' :
    typeof firstVal === 'boolean' ? 'boolean' :
    typeof firstVal === 'string' ? 'string' : undefined;

  return (
    <div
      ref={ref}
      className={[
        'rounded border text-xs select-none transition-all',
        isSearchMatch ? 'bg-yellow-50 ring-1 ring-yellow-300' : 'border-transparent',
      ].join(' ')}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-1.5 px-2 py-[3px] cursor-pointer hover:bg-gray-50 rounded"
        onClick={() => setPanelOpen((v) => !v)}
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${mappedCount > 0 ? 'bg-emerald-400' : 'bg-rose-300'}`} />
        <span className="font-mono text-gray-700">{node.key}</span>
        <span className="text-blue-500 font-mono ml-0.5">[]</span>
        <span className="ml-auto text-[10px] font-medium text-orange-600 border border-orange-200 bg-orange-50 rounded px-1.5 py-px">
          {mappedCount}/{currentItems.length} mapped
        </span>
        <span className="text-gray-400 text-[10px]">{panelOpen ? '▾' : '▸'}</span>
      </div>

      {/* Inline mapping panel */}
      {panelOpen && (
        <div className="mx-2 mb-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2 py-2 space-y-1">
          {currentItems.length === 0 && !primAmId && (
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-[10px] text-gray-400 italic">Empty array — no elements to map.</span>
              <button
                className="ml-auto text-[10px] font-medium text-teal-600 border border-teal-300 bg-white rounded px-2 py-0.5 hover:bg-teal-50 transition"
                onClick={onMapEmptyArray}
              >
                Map as empty array
              </button>
            </div>
          )}

          {currentItems.length === 0 && primAmId && (
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-[10px] text-emerald-600 font-medium">✓ Mapped as empty array</span>
              <button
                className="ml-auto text-[10px] text-rose-400 hover:text-rose-600 transition"
                onClick={onClearEmptyArray}
                title="Clear mapping"
              >
                Clear
              </button>
            </div>
          )}

          {currentItems.map((item, idx) => {
            const mode: MappingMode =
              item.partnerPropKey !== undefined ? 'partner' :
              item.globalSetId !== undefined ? 'global' :
              item.fixedValue !== undefined ? 'fixed' : 'source';

            return (
              <div key={idx} className="flex items-center gap-1">
                <span className="font-mono text-[10px] text-gray-400 w-5 text-right flex-shrink-0">[{idx}]</span>
                <span className="text-gray-300 flex-shrink-0 text-xs">←</span>
                <ModeToggleButtons
                  current={mode}
                  onChange={(next) => saveItem(idx, { ...MODE_INITIAL_FIELDS[next], source: MODE_INITIAL_FIELDS[next].source ?? item.source ?? '' })}
                />
                <LeafValueInput
                  mode={mode}
                  sourceValue={item.source ?? ''}
                  sourcePaths={sourcePaths}
                  onSourceChange={(v) => saveItem(idx, { ...item, source: v })}
                  fixedValue={item.fixedValue ?? ''}
                  targetFieldType={itemType}
                  onFixedChange={(v) => saveItem(idx, { ...item, fixedValue: v })}
                  partnerPropKey={item.partnerPropKey ?? ''}
                  partnerAdapterProperties={partnerAdapterProperties}
                  datalistId={`prim-partner-${node.path}-${idx}`}
                  onPartnerChange={(v) => saveItem(idx, { ...item, partnerPropKey: v })}
                  globalSetId={item.globalSetId ?? ''}
                  globalKey={item.globalKey ?? ''}
                  allGlobalSets={allGlobalSets}
                  onGlobalSetChange={(setId) => saveItem(idx, { ...item, globalSetId: setId, globalKey: '' })}
                  onGlobalKeyChange={(key) => saveItem(idx, { ...item, globalKey: key })}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
