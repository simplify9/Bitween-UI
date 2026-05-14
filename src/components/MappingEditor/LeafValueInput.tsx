import React from 'react';
import { GlobalAdapterValuesSetModel } from 'src/types/globalAdapterValuesSets';
import { MappingMode } from 'src/types/mapping';
import { GlobalSetSelector } from './GlobalSetSelector';
import { FixedStringInput } from './FixedStringInput';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeafValueInputProps {
  mode: MappingMode;

  // source mode
  sourceValue: string;
  sourcePaths: string[];
  onSourceChange: (value: string) => void;

  // fixed mode
  fixedValue: string;
  targetFieldType?: 'string' | 'number' | 'boolean';
  onFixedChange: (value: string) => void;

  // partner mode
  partnerPropKey: string;
  partnerAdapterProperties: Record<string, string>;
  datalistId: string;
  onPartnerChange: (value: string) => void;

  // global mode
  globalSetId: string;
  globalKey: string;
  allGlobalSets: GlobalAdapterValuesSetModel[];
  onGlobalSetChange: (setId: string) => void;
  onGlobalKeyChange: (key: string) => void;
}

// ─── LeafValueInput ───────────────────────────────────────────────────────────

export const LeafValueInput: React.FC<LeafValueInputProps> = ({
  mode,
  sourceValue,
  sourcePaths,
  onSourceChange,
  fixedValue,
  targetFieldType,
  onFixedChange,
  partnerPropKey,
  partnerAdapterProperties,
  datalistId,
  onPartnerChange,
  globalSetId,
  globalKey,
  allGlobalSets,
  onGlobalSetChange,
  onGlobalKeyChange,
}) => {
  if (mode === 'fixed') {
    if (targetFieldType === 'boolean') {
      return (
        <select
          className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0"
          value={fixedValue}
          onChange={(e) => onFixedChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">— pick —</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (targetFieldType === 'number') {
      return (
        <input
          className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0 placeholder-amber-300"
          placeholder="0"
          type="number"
          value={fixedValue}
          onChange={(e) => onFixedChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    // string (or unknown) target — allow embedding {{ field }} variables
    return (
      <FixedStringInput
        value={fixedValue}
        sourcePaths={sourcePaths.filter((p) => !p.includes('['))}
        onChange={onFixedChange}
      />
    );
  }

  if (mode === 'partner') {
    return (
      <div className="flex-1 relative min-w-0" onClick={(e) => e.stopPropagation()}>
        <input
          list={datalistId}
          className="w-full border-0 bg-transparent font-mono text-xs focus:outline-none text-emerald-600 placeholder-emerald-300"
          placeholder="property key…"
          value={partnerPropKey}
          onChange={(e) => onPartnerChange(e.target.value)}
        />
        <datalist id={datalistId}>
          {Object.keys(partnerAdapterProperties).map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
      </div>
    );
  }

  if (mode === 'global') {
    return (
      <GlobalSetSelector
        setId={globalSetId}
        keyValue={globalKey}
        allGlobalSets={allGlobalSets}
        onSetChange={onGlobalSetChange}
        onKeyChange={onGlobalKeyChange}
      />
    );
  }

  // source mode
  const isOrphanSource = sourceValue !== '' && !sourcePaths.includes(sourceValue);
  return (
    <select
      className={[
        'flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none min-w-0',
        isOrphanSource ? 'text-amber-500' : 'text-gray-500',
      ].join(' ')}
      value={sourceValue}
      onChange={(e) => onSourceChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="">— unassigned —</option>
      {isOrphanSource && (
        <option value={sourceValue}>⚠ {sourceValue} (not found in input)</option>
      )}
      {sourcePaths.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
};
