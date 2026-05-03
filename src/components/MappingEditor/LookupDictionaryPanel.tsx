import React from 'react';
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi';
import { LookupDictionary } from 'src/types/mapping';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LookupDictionaryPanelProps {
  dictionary: LookupDictionary | undefined;
  targetFieldType?: 'string' | 'number' | 'boolean';
  onChange: (next: LookupDictionary | undefined) => void;
  onClose: () => void;
}

// ─── LookupDictionaryPanel ────────────────────────────────────────────────────
// Renders the violet lookup panel: entry rows (from → to), fallback, remove.
// Fully controlled — callers own the LookupDictionary value.

export const LookupDictionaryPanel: React.FC<LookupDictionaryPanelProps> = ({
  dictionary,
  targetFieldType,
  onChange,
  onClose,
}) => {
  const entries = dictionary?.entries ?? [];

  const patchEntry = (idx: number, patch: { from?: string; to?: string }) => {
    const next = entries.map((e, i) => i === idx ? { ...e, ...patch } : e);
    onChange({ fallback: 'null', ...dictionary, entries: next });
  };

  const removeEntry = (idx: number) => {
    const next = entries.filter((_, i) => i !== idx);
    onChange(next.length === 0 ? undefined : { fallback: 'null', ...dictionary, entries: next });
  };

  const addEntry = () => {
    onChange({ fallback: 'null', ...dictionary, entries: [...entries, { from: '', to: '' }] });
  };

  const patchFallback = (fallback: LookupDictionary['fallback']) => {
    onChange({ ...({ fallback: 'null', ...dictionary, entries } as LookupDictionary), fallback });
  };

  const patchFallbackValue = (fallbackValue: string) => {
    onChange({ fallback: 'null', ...dictionary, entries, fallbackValue });
  };

  const removeLookup = () => {
    onChange(undefined);
    onClose();
  };

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-2 space-y-1.5">
      {/* Entry rows */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {entries.length === 0 && (
          <p className="text-[10px] text-violet-400 italic px-1">No entries yet.</p>
        )}
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <input
              autoFocus={idx === 0}
              className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 placeholder-gray-300"
              placeholder="source value"
              value={entry.from}
              onChange={(e) => patchEntry(idx, { from: e.target.value })}
            />
            <span className="text-gray-300 text-[10px] flex-shrink-0 select-none">→</span>
            {targetFieldType === 'boolean' ? (
              <select
                className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                value={entry.to}
                onChange={(e) => patchEntry(idx, { to: e.target.value })}
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
                onChange={(e) => patchEntry(idx, { to: e.target.value })}
              />
            )}
            <button
              className="flex-shrink-0 text-gray-300 hover:text-rose-400 transition"
              onClick={() => removeEntry(idx)}
            >
              <HiOutlineTrash size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Add entry */}
      <button
        className="flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 transition font-medium"
        onClick={addEntry}
      >
        <HiOutlinePlusCircle size={11} /> Add entry
      </button>

      {/* Fallback — only when at least one entry exists */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-violet-200">
          <span className="text-[10px] text-gray-500 flex-shrink-0 select-none">If not found:</span>
          <select
            className="text-xs border border-violet-200 bg-white rounded px-1.5 py-0.5 font-mono focus:outline-none focus:border-violet-400 text-violet-700"
            value={dictionary?.fallback ?? 'null'}
            onChange={(e) => patchFallback(e.target.value as LookupDictionary['fallback'])}
          >
            <option value="null">output null</option>
            <option value="custom">use custom fallback</option>
          </select>
          {dictionary?.fallback === 'custom' && (
            targetFieldType === 'boolean' ? (
              <select
                className="flex-1 min-w-0 border border-violet-200 bg-white rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:border-violet-400 text-violet-700"
                value={dictionary.fallbackValue ?? ''}
                onChange={(e) => patchFallbackValue(e.target.value)}
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
                value={dictionary.fallbackValue ?? ''}
                onChange={(e) => patchFallbackValue(e.target.value)}
              />
            )
          )}
        </div>
      )}

      {/* Remove lookup */}
      <button
        className="text-[10px] text-rose-400 hover:text-rose-600 transition"
        onClick={removeLookup}
      >
        Remove lookup
      </button>
    </div>
  );
};
