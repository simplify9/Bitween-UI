import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineRefresh,
  HiOutlineTrash,
} from 'react-icons/hi';
import { MdOutlineUndo, MdOutlineRedo } from 'react-icons/md';
import {
  useMappingEditorState,
  useMappingEditorDispatch,
  autoMatch,
  clearAll,
  redo,
  undo,
  setSelectedPartner,
} from './context/MappingEditorContext';
import { usePartnersQuery, usePartnerQuery } from 'src/client/apis/partnersApi';

// ─── Mode toggle button ───────────────────────────────────────────────────────

const ModeTab: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={[
      'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition border',
      active
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600',
    ].join(' ')}
  >
    {icon}
    {label}
  </button>
);

// ─── MappingEditorToolbar ─────────────────────────────────────────────────────

export interface MappingEditorToolbarProps {
  subscriptionId: number;
  isSaving: boolean;
  saveSuccess: boolean;
  handleModeChange: (mode: 'visual' | 'manual') => void;
  handleValidate: () => void;
  handleSave: () => void | Promise<void>;
}

const MappingEditorToolbar: React.FC<MappingEditorToolbarProps> = ({
  subscriptionId,
  isSaving,
  saveSuccess,
  handleModeChange,
  handleValidate,
  handleSave,
}) => {
  const navigate = useNavigate();
  const dispatch = useMappingEditorDispatch();
  const { mode, fieldMappings, arrayMappings, past, future, selectedPartnerId } = useMappingEditorState();

  // Sync local dropdown state when Redux selectedPartnerId changes (including reset to null)
  const { data: partners } = usePartnersQuery();
  const { data: partnerDetail, isFetching: isPartnerFetching } = usePartnerQuery(selectedPartnerId ?? 0, { skip: selectedPartnerId == null });

  const handlePartnerChange = (idStr: string) => {
    const pid = idStr ? Number(idStr) : null;
    if (pid == null) {
      dispatch(setSelectedPartner(null, {}));
    } else {
      dispatch(setSelectedPartner(pid, {}));
    }
    // partnerDetail effect below handles dispatch when data arrives
  };

  React.useEffect(() => {
    if (selectedPartnerId == null) return;
    if (isPartnerFetching) return;
    dispatch(setSelectedPartner(selectedPartnerId, partnerDetail?.adapterProperties ?? {}));
  }, [partnerDetail, selectedPartnerId, isPartnerFetching]);

  const assignedFieldCount = useMemo(
    () => fieldMappings.filter((m) => m.target && (Boolean(m.source) || m.fixedValue !== undefined)).length,
    [fieldMappings]
  );

  const isVisualMode = mode === 'visual';
  const isManualMode = mode === 'manual';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
      {/* Back */}
      <button
        onClick={() => navigate(`/subscriptions/${subscriptionId}`)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1 transition mr-1"
      >
        <HiArrowLeft size={13} /> Back
      </button>

      <div className="h-5 w-px bg-gray-200" />

      {/* Title */}
      <span className="font-bold text-gray-800 text-sm tracking-tight">
        Mapping Editor
      </span>
      <span className="text-xs text-gray-400">
        {assignedFieldCount} mappings ·{' '}
        {arrayMappings.length} array loops
      </span>

      <div className="h-5 w-px bg-gray-200" />

      {/* Mode toggle */}
      <div className="flex items-center gap-1">
        <ModeTab
          active={isVisualMode}
          onClick={() => handleModeChange('visual')}
          label="Visual"
          icon={<span className="text-[10px]">⛶</span>}
        />
        <ModeTab
          active={isManualMode}
          onClick={() => handleModeChange('manual')}
          label="Manual"
          icon={<span className="text-[10px]">{'{}'}</span>}
        />
      </div>

      <div className="h-5 w-px bg-gray-200" />

      {/* Undo / redo */}
      <button
        onClick={() => dispatch(undo())}
        disabled={past.length === 0}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition text-gray-600"
        title="Undo (Ctrl+Z)"
      >
        <MdOutlineUndo size={16} />
      </button>
      <button
        onClick={() => dispatch(redo())}
        disabled={future.length === 0}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition text-gray-600"
        title="Redo (Ctrl+Y)"
      >
        <MdOutlineRedo size={16} />
      </button>

      <div className="h-5 w-px bg-gray-200" />

      {/* Actions */}
      {isVisualMode && (
        <>
          <button
            onClick={() => dispatch(autoMatch())}
            className="text-xs border border-gray-300 rounded px-2.5 py-1 hover:bg-gray-50 transition"
            title="Auto-match fields by name similarity"
          >
            <HiOutlineRefresh className="inline mr-1" size={11} />
            Auto-match
          </button>
          <button
            onClick={() => dispatch(clearAll())}
            className="text-xs border border-rose-200 text-rose-500 rounded px-2.5 py-1 hover:bg-rose-50 transition"
            title="Clear all mappings"
          >
            <HiOutlineTrash className="inline mr-1" size={11} />
            Clear
          </button>
        </>
      )}

      <button
        onClick={handleValidate}
        className="text-xs border border-amber-300 text-amber-600 rounded px-2.5 py-1 hover:bg-amber-50 transition"
      >
        Validate
      </button>

      {/* Partner selector — visual mode only — for testing partner-scoped mappings */}
      {isVisualMode && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide flex-shrink-0">Test partner</span>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 bg-white text-gray-700 max-w-[160px]"
            value={selectedPartnerId ?? ''}
            onChange={(e) => handlePartnerChange(e.target.value)}
          >
            <option value="">— none —</option>
            {(partners ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {selectedPartnerId && (
            <span className="text-[10px] text-emerald-600 font-medium flex-shrink-0">
              {Object.keys(partnerDetail?.adapterProperties ?? {}).length} props
            </span>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {saveSuccess && (
          <span className="text-xs text-emerald-600 font-medium animate-pulse">
            ✓ Saved
          </span>
        )}
        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="text-xs bg-blue-600 text-white rounded px-4 py-1.5 hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default MappingEditorToolbar;
