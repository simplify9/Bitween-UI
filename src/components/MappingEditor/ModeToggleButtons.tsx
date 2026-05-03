import React from 'react';
import { MappingMode } from 'src/types/mapping';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModeToggleButtonsProps {
  current: MappingMode;
  onChange: (mode: MappingMode) => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODE_CONFIG: { mode: MappingMode; label: string; activeCls: string; inactiveCls: string }[] = [
  {
    mode: 'source',
    label: 'Source',
    activeCls: 'bg-blue-500 text-white',
    inactiveCls: 'text-gray-400 hover:bg-gray-50',
  },
  {
    mode: 'fixed',
    label: 'Fixed',
    activeCls: 'bg-amber-500 text-white border-l border-amber-400',
    inactiveCls: 'text-gray-400 border-l border-gray-200 hover:bg-gray-50',
  },
  {
    mode: 'partner',
    label: 'Partner',
    activeCls: 'bg-emerald-500 text-white border-l border-emerald-400',
    inactiveCls: 'text-gray-400 border-l border-gray-200 hover:bg-gray-50',
  },
  {
    mode: 'global',
    label: 'Global',
    activeCls: 'bg-teal-500 text-white border-l border-teal-400',
    inactiveCls: 'text-gray-400 border-l border-gray-200 hover:bg-gray-50',
  },
];

// ─── ModeToggleButtons ────────────────────────────────────────────────────────

export const ModeToggleButtons: React.FC<ModeToggleButtonsProps> = ({ current, onChange }) => (
  <div className="flex flex-shrink-0 rounded overflow-hidden border border-gray-200 text-[10px] font-medium">
    {MODE_CONFIG.map(({ mode, label, activeCls, inactiveCls }) => (
      <button
        key={mode}
        onClick={(e) => {
          e.stopPropagation();
          onChange(mode);
        }}
        className={`px-1.5 py-0.5 ${current === mode ? activeCls : inactiveCls}`}
      >
        {label}
      </button>
    ))}
  </div>
);
