import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiPlusCircle,
} from 'react-icons/hi';
import { MdOutlineUndo, MdOutlineRedo } from 'react-icons/md';
import {
  MappingEditorProvider,
  useMappingEditorState,
  useMappingEditorDispatch,
  autoMatch,
  clearAll,
  generateFromTargetJson,
  loadEditorContext,
  openArrayModal,
  redo,
  setArrayMappings,
  setFieldMappings,
  setInputJson,
  setMode,
  setOutputJson,
  setSearchInput,
  setSearchOutput,
  setValidationErrors,
  syncManualTemplate,
  togglePreview,
  undo,
} from './MappingEditorContext';
import { NATIVE_JSON_MAPPER_ID, ValidationError } from './types';
import {
  buildTree,
  flattenLeafPaths,
  tryParseJson,
  TreeNode,
} from 'src/utils/mappingPreview';
import SourceTree from './SourceTree';
import OutputTree from './OutputTree';
import ConnectionCanvas from './ConnectionCanvas';
import ManualEditor from './ManualEditor';
import LivePreview from './LivePreview';
import ArrayMappingModal from './ArrayMappingModal';
import { useSubscriptionQuery, useSaveMapperMutation } from 'src/client/apis/subscriptionsApi';
import { KeyValuePair } from 'src/types/common';
import { generateScriban, parseScriban } from 'src/utils/scribanGenerator';
import { useGlobalAdapterValuesSetsQuery } from 'src/client/apis/globalAdapterValuesSetsApi';

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

// ─── MappingEditorPage (provider wrapper) ────────────────────────────────────

const MappingEditorPage: React.FC = () => (
  <MappingEditorProvider>
    <MappingEditorInner />
  </MappingEditorProvider>
);

// ─── MappingEditorInner ───────────────────────────────────────────────────────

const MappingEditorInner: React.FC = () => {
  const dispatch = useMappingEditorDispatch();
  const {
    mode,
    fieldMappings,
    arrayMappings,
    inputJson,
    outputJson,
    showPreview,
    past,
    future,
    editingArrayId,
    manualTemplate,
    isManualDirty,
    searchInput,
    searchOutput,
  } = useMappingEditorState();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);

  // ── Data loading ────────────────────────────────────────────────────────────
  const { data: subscriptionData } = useSubscriptionQuery(subscriptionId, { skip: !subscriptionId, refetchOnMountOrArgChange: true });
  const [saveMapper, { isLoading: isSaving }] = useSaveMapperMutation();
  const [loadedForId, setLoadedForId] = useState<number | null>(null);
  const pendingIdRef = useRef<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showNullWarning, setShowNullWarning] = useState(false);
  const [jsonAreaHeight, setJsonAreaHeight] = useState(96); // px — both panels share this
  const srcTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tgtTextareaRef = useRef<HTMLTextAreaElement>(null);
  // Global adapter values sets — used for enum lookup in live preview + template generation
  const { data: setsData } = useGlobalAdapterValuesSetsQuery({ offset: 0, limit: 1000 });
  const valuesSetMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    for (const s of setsData?.result ?? []) {
      map[s.id] = s.values;
    }
    return map;
  }, [setsData]);
  // Sync both textareas to the height of whichever was just resized
  const syncHeight = useCallback((from: 'src' | 'tgt') => {
    const el = from === 'src' ? srcTextareaRef.current : tgtTextareaRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setJsonAreaHeight(h);
  }, []);

  useEffect(() => {
    // Whenever subscriptionId changes, clear Redux state immediately and record which ID we're waiting for
    pendingIdRef.current = subscriptionId || null;
    dispatch(loadEditorContext({ subscriptionId: subscriptionId || 0, mapperProperties: [] }));
    setLoadedForId(null);
  }, [subscriptionId]);

  useEffect(() => {
    // Only load when the data arriving is for the subscription we are currently on
    if (!subscriptionData || !pendingIdRef.current) return;
    if (pendingIdRef.current !== subscriptionId) return;
    dispatch(
      loadEditorContext({
        subscriptionId,
        mapperId: subscriptionData.mapperId,
        mapperProperties: subscriptionData.mapperProperties,
      })
    );
    dispatch(autoMatch());
    setLoadedForId(subscriptionId);
  }, [subscriptionData]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fieldMappings, arrayMappings, manualTemplate]);

  // ── Mode change with Manual ↔ Visual/Canvas sync ─────────────────────────────
  const handleModeChange = useCallback(
    (newMode: 'visual' | 'manual') => {
      if (mode === 'manual' && newMode !== 'manual' && isManualDirty && manualTemplate) {
        // Leaving Manual with dirty edits — parse template back into Redux state
        const parsed = parseScriban(manualTemplate);
        dispatch(
          setFieldMappings(
            parsed.fieldMappings.map((m, i) => ({ id: `parsed-${i}-${Date.now()}`, ...m }))
          )
        );
        dispatch(
          setArrayMappings(
            parsed.arrayMappings.map((am, i) => ({
              id: `parsed-am-${i}-${Date.now()}`,
              ...am,
              mappings: am.mappings.map((m, j) => ({
                id: `parsed-am-${i}-${j}-${Date.now()}`,
                ...m,
              })),
            }))
          )
        );
      } else if (newMode === 'manual') {
        // Entering Manual — always regenerate template from current Redux state
        dispatch(syncManualTemplate(generateScriban(fieldMappings, arrayMappings, valuesSetMap)));
      }
      dispatch(setMode(newMode));
    },
    [mode, isManualDirty, manualTemplate, fieldMappings, arrayMappings, valuesSetMap, dispatch]
  );

  // ── Trees ───────────────────────────────────────────────────────────────────
  const inputObj = useMemo(() => tryParseJson(inputJson), [inputJson]);
  // outputObj is only used for "Generate from JSON" — the live tree is always driven by fieldMappings
  const outputObj = useMemo(() => tryParseJson(outputJson), [outputJson]);
  const sourceTree: TreeNode[] = useMemo(
    () => (inputObj ? buildTree(inputObj) : []),
    [inputObj]
  );

  // When target JSON is first provided, initialize fields to explicit null defaults.
  // Track which outputJson value has already been auto-generated so we only fire
  // once per distinct JSON string, regardless of fieldMappings changes.
  const autoGeneratedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!outputObj) return;
    if (autoGeneratedForRef.current === outputJson) return;
    if (fieldMappings.length > 0 || arrayMappings.length > 0) return;
    autoGeneratedForRef.current = outputJson;
    dispatch(generateFromTargetJson());
  }, [outputObj, outputJson, fieldMappings.length, arrayMappings.length, dispatch]);

  const outputTree: TreeNode[] = useMemo(() => {
    // Use target JSON as the base structure when available, then merge in any
    // manually-added fields from fieldMappings that aren't already in the JSON.
    const basePaths: string[] = outputObj
      ? buildTree(outputObj).flatMap(flattenLeafPaths)
      : fieldMappings.map((m) => m.target).filter(Boolean);

    // Merge manually-added mapping targets that aren't already in the base set
    if (outputObj) {
      const pathSet = new Set(basePaths);
      for (const m of fieldMappings) {
        if (m.target && !pathSet.has(m.target)) {
          basePaths.push(m.target);
          pathSet.add(m.target);
        }
      }
    }

    const paths = basePaths;
    for (const am of arrayMappings) {
      if (!am.target) continue;
      const containerPath = `${am.target}[*]`;
      if (!paths.includes(containerPath)) paths.push(containerPath);
      for (const m of am.mappings) {
        if (m.target) paths.push(`${am.target}[*].${m.target}`);
      }
    }
    return buildMappingTree(paths);
  }, [outputObj, fieldMappings, arrayMappings]);

  const sourcePaths = useMemo(
    () => sourceTree.flatMap(flattenLeafPaths),
    [sourceTree]
  );

  const outputTargets = useMemo(
    () => outputTree.flatMap(flattenLeafPaths),
    [outputTree]
  );

  const assignedFieldCount = useMemo(
    () =>
      fieldMappings.filter(
        (m) =>
          m.target &&
          (Boolean(m.source) || m.fixedValue !== undefined || Boolean(m.isNullValue))
      ).length,
    [fieldMappings]
  );

  const nullAssignedTargets = useMemo(() => {
    const rootNulls = fieldMappings
      .filter((m) => m.target.trim() && m.isNullValue)
      .map((m) => m.target.trim());
    const arrayNulls = arrayMappings.flatMap((am) =>
      (am.mappings ?? [])
        .filter((m) => m.target.trim() && m.isNullValue)
        .map((m) => `${am.target}[*].${m.target.trim()}`)
    );
    return Array.from(new Set([...rootNulls, ...arrayNulls]));
  }, [fieldMappings, arrayMappings]);

  const unassignedTargets = useMemo(() => {
    const isAssigned = (m?: { source?: string; fixedValue?: string; isNullValue?: boolean }) =>
      Boolean(m && (m.source || m.fixedValue !== undefined || m.isNullValue));

    const result: string[] = [];
    for (const target of outputTargets) {
      if (target.includes('[*].')) {
        const [arrayTarget, ...rest] = target.split('[*].');
        const innerTarget = rest.join('[*].');
        const am = arrayMappings.find((x) => x.target === arrayTarget);
        const inner = am?.mappings.find((m) => m.target === innerTarget);
        if (!isAssigned(inner)) result.push(target);
        continue;
      }

      if (target.endsWith('[*]')) {
        const arrayTarget = target.slice(0, -3);
        const am = arrayMappings.find((x) => x.target === arrayTarget);
        if (!am?.source) result.push(target);
        continue;
      }

      const mapping = fieldMappings.find((m) => m.target === target);
      if (!isAssigned(mapping)) result.push(target);
    }

    return Array.from(new Set(result));
  }, [outputTargets, fieldMappings, arrayMappings]);

  // ── Refs for connection canvas ──────────────────────────────────────────────
  const sourceRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const targetRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  const [, forceRedraw] = useState(0);
  const sourcePanelRef = useRef<HTMLDivElement>(null);
  const targetPanelRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleSourceRef = useCallback((path: string, el: HTMLElement | null) => {
    if (el) sourceRefsMap.current.set(path, el);
    else sourceRefsMap.current.delete(path);
    forceRedraw((n) => n + 1);
  }, []);

  const handleTargetRef = useCallback((path: string, el: HTMLElement | null) => {
    if (el) targetRefsMap.current.set(path, el);
    else targetRefsMap.current.delete(path);
    forceRedraw((n) => n + 1);
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const handleValidate = useCallback(() => {
    const errors: ValidationError[] = [];
    for (const m of fieldMappings) {
      if (!m.target.trim()) {
        errors.push({ type: 'error', message: `Mapping has no target field`, path: m.id });
      }
      if (!m.source && m.fixedValue === undefined && !m.isNullValue) {
        errors.push({
          type: 'warning',
          message: `"${m.target}" has no assigned source/fixed/null value`,
          path: m.target,
        });
      }
    }
    for (const am of arrayMappings) {
      if (!am.source) errors.push({ type: 'error', message: `Array mapping missing source path` });
      if (!am.target) errors.push({ type: 'error', message: `Array mapping missing target path` });
      if (am.mappings.length === 0) {
        errors.push({
          type: 'warning',
          message: `Array mapping "${am.source} → ${am.target}" has no field mappings`,
        });
      }
    }
    dispatch(setValidationErrors(errors));
  }, [fieldMappings, arrayMappings, dispatch]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  const persistSave = useCallback(async () => {
    // Always generate the Scriban template — use the manual template if in manual mode
    // and it hasn't been modified since last sync, otherwise regenerate from state
    const templateToSave =
      mode === 'manual' && manualTemplate
        ? manualTemplate
        : generateScriban(fieldMappings, arrayMappings, valuesSetMap);

    const mapperProperties: KeyValuePair[] = [
      { key: 'ScribanTemplate', value: templateToSave },
    ];
    if (arrayMappings.length > 0) {
      mapperProperties.push({ key: 'ArrayRules', value: JSON.stringify(arrayMappings) });
    }
    if (inputJson.trim()) {
      mapperProperties.push({ key: 'SourceJson', value: inputJson });
    }
    if (outputJson.trim()) {
      mapperProperties.push({ key: 'TargetJson', value: outputJson });
    }

    const result = await saveMapper({
      id: subscriptionId,
      mapperId: NATIVE_JSON_MAPPER_ID,
      mapperProperties,
    });

    if ('data' in result) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }, [
    fieldMappings,
    arrayMappings,
    inputJson,
    outputJson,
    mode,
    manualTemplate,
    valuesSetMap,
    subscriptionId,
    saveMapper,
  ]);

  const handleSave = useCallback(async (force = false) => {
    handleValidate();
    if (unassignedTargets.length > 0) {
      setShowNullWarning(true);
      return;
    }
    if (!force && nullAssignedTargets.length > 0) {
      setShowNullWarning(true);
      return;
    }
    setShowNullWarning(false);
    await persistSave();
  }, [handleValidate, nullAssignedTargets.length, unassignedTargets.length, persistSave]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isVisualMode = mode === 'visual';
  const isManualMode = mode === 'manual';

  return (
    <div className="fixed inset-0 z-[40] bg-white flex flex-col overflow-hidden">
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
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
              onClick={() => dispatch(openArrayModal({ id: '__new__' }))}
              className="text-xs border border-gray-300 rounded px-2.5 py-1 hover:bg-gray-50 transition"
              title="Add new array mapping"
            >
              <HiPlusCircle className="inline mr-1" size={11} />
              Array loop
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

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      {isManualMode ? (
        <div className="flex-1 overflow-hidden">
          <ManualEditor />
        </div>
      ) : (
        /* Visual mode: 3-panel layout */
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Source JSON panel ─── */}
          <div className="w-[30%] min-w-[240px] max-w-[380px] flex flex-col border-r border-gray-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Source JSON
                </span>
              </div>
              <div className="relative">
                <HiOutlineSearch className="absolute left-2 top-1.5 text-gray-400" size={11} />
                <input
                  className="w-full border border-gray-200 rounded pl-6 pr-2 py-1 text-xs focus:outline-none focus:border-blue-400 font-mono"
                  placeholder="Search fields…"
                  value={searchInput}
                  onChange={(e) => dispatch(setSearchInput(e.target.value))}
                />
              </div>
            </div>

            {/* Source JSON input */}
            <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
              <textarea
                ref={srcTextareaRef}
                className="w-full min-h-[60px] border border-gray-200 rounded px-2 py-1.5 text-[11px] font-mono resize-y focus:outline-none focus:border-blue-400 bg-gray-50"
                style={{ height: jsonAreaHeight }}
                placeholder='{ "paste": "source JSON here" }'
                value={inputJson}
                onChange={(e) => dispatch(setInputJson(e.target.value))}
                onMouseUp={() => syncHeight('src')}
                onTouchEnd={() => syncHeight('src')}
              />
              {inputJson && !inputObj && (
                <p className="text-[10px] text-rose-500 mt-0.5">Invalid JSON</p>
              )}
            </div>

            {/* Source fields tree */}
            <div ref={sourcePanelRef} className="flex-1 overflow-y-auto">
              <SourceTree nodes={sourceTree} onLeafRef={handleSourceRef} />
            </div>
          </div>

          {/* ── Center: Connection canvas ─── */}
          <div
            ref={canvasContainerRef}
            className="w-[140px] flex-shrink-0 relative border-r border-gray-200 bg-slate-50 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-300 rotate-90 select-none pointer-events-none whitespace-nowrap">
                connections
              </span>
            </div>
            <ConnectionCanvas
              sourceRefs={sourceRefsMap.current}
              targetRefs={targetRefsMap.current}
              sourceScroll={sourcePanelRef.current}
              targetScroll={targetPanelRef.current}
              width={140}
            />
          </div>

          {/* ── Right: Output tree ─── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Output Structure
                </span>
                <span className="text-xs text-gray-400">
                  {fieldMappings.filter((m) => m.target).length} fields ·{' '}
                  {assignedFieldCount} assigned
                </span>
                <button
                  onClick={() => dispatch(generateFromTargetJson())}
                  disabled={!outputJson.trim()}
                  className="ml-auto text-[10px] border border-gray-200 rounded px-2 py-0.5 hover:bg-gray-100 disabled:opacity-40 transition"
                  title="Generate output structure from Target JSON"
                >
                  Generate from JSON
                </button>
              </div>
              <div className="relative">
                <HiOutlineSearch className="absolute left-2 top-1.5 text-gray-400" size={11} />
                <input
                  className="w-full border border-gray-200 rounded pl-6 pr-2 py-1 text-xs focus:outline-none focus:border-blue-400 font-mono"
                  placeholder="Search fields…"
                  value={searchOutput}
                  onChange={(e) => dispatch(setSearchOutput(e.target.value))}
                />
              </div>
            </div>

            {/* Target JSON input (optional) */}
            <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
              <textarea
                ref={tgtTextareaRef}
                className="w-full min-h-[40px] border border-gray-200 rounded px-2 py-1.5 text-[11px] font-mono resize-y focus:outline-none focus:border-blue-400 bg-gray-50"
                style={{ height: jsonAreaHeight }}
                placeholder='{ "desired": "output shape" }  (optional — used to generate structure)'
                value={outputJson}
                onChange={(e) => dispatch(setOutputJson(e.target.value))}
                onMouseUp={() => syncHeight('tgt')}
                onTouchEnd={() => syncHeight('tgt')}
              />
            </div>

            {/* Right panel split: output tree + optional preview */}
            <div
              className={`flex flex-1 overflow-hidden ${
                showPreview ? 'flex-row divide-x divide-gray-200' : 'flex-col'
              }`}
            >
              <div ref={targetPanelRef} className={`overflow-y-auto ${showPreview ? 'w-1/2' : 'flex-1'}`}>
                <OutputTree nodes={outputTree} sourcePaths={sourcePaths} onLeafRef={handleTargetRef} />
              </div>
              {showPreview && (
                <div className="w-1/2 overflow-hidden">
                  <LivePreview />
                </div>
              )}
            </div>

            {/* Preview toggle */}
            <div className="flex-shrink-0 border-t border-gray-200">
              <button
                onClick={() => dispatch(togglePreview())}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
              >
                {showPreview ? '▾ Hide Preview' : '▸ Show Live Preview'}
                {!showPreview && fieldMappings.length > 0 && (
                  <span className="ml-auto text-gray-400">
                    {assignedFieldCount} mapped
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Array mapping modal */}
      {editingArrayId !== undefined && <ArrayMappingModal />}

      {showNullWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNullWarning(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[640px] max-w-[92vw] max-h-[80vh] p-5 flex flex-col gap-3">
            <h3 className="text-base font-semibold text-rose-600">Warning: Null/Unassigned Values Detected</h3>
            <p className="text-sm text-gray-700">
              You are about to save with {nullAssignedTargets.length + unassignedTargets.length} field
              {nullAssignedTargets.length + unassignedTargets.length === 1 ? '' : 's'} that are null or unassigned.
            </p>
            {unassignedTargets.length > 0 && (
              <p className="text-sm text-amber-700 font-medium">
                You cannot continue saving while unassigned targets exist. Assign them to source/fixed value or set them to null.
              </p>
            )}
            <div className="border border-rose-100 rounded bg-rose-50/40 px-3 py-2 space-y-2">
              <div className="max-h-56 overflow-y-auto pr-1">
                {nullAssignedTargets.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-rose-700 mb-1">Null-assigned targets ({nullAssignedTargets.length})</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-xs font-mono text-rose-800 mb-2">
                      {nullAssignedTargets.map((path) => (
                        <li key={`null-${path}`}>{path}</li>
                      ))}
                    </ul>
                  </>
                )}
                {unassignedTargets.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-amber-700 mb-1">Unassigned targets ({unassignedTargets.length})</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-xs font-mono text-amber-800">
                      {unassignedTargets.map((path) => (
                        <li key={`unassigned-${path}`}>{path}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowNullWarning(false)}
                className="text-sm border border-gray-300 text-gray-700 rounded px-4 py-1.5 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              {unassignedTargets.length === 0 && (
                <button
                  onClick={() => void handleSave(true)}
                  className="text-sm bg-rose-600 text-white rounded px-4 py-1.5 hover:bg-rose-700 transition"
                >
                  Continue Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper: build tree from flat target paths ────────────────────────────────

function buildMappingTree(targetPaths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of targetPaths) {
    const parts = path.split('.');
    insertNode(root, parts, 0, '');
  }

  return root;
}

function insertNode(
  nodes: TreeNode[],
  parts: string[],
  depth: number,
  parentPath: string
): void {
  if (parts.length === 0) return;
  const rawPart = parts[0];
  const isArray = rawPart.includes('[*]') || rawPart.includes('[]');
  const key = rawPart.replace(/\[\*\]|\[\]/g, '');
  const currentPath = parentPath ? `${parentPath}.${rawPart}` : rawPart;

  let existing = nodes.find((n) => n.key === key);
  if (parts.length === 1) {
    if (!existing) {
      nodes.push({ key, path: currentPath, type: 'leaf', children: [] });
    }
    return;
  }

  if (!existing) {
    existing = { key, path: currentPath, type: isArray ? 'array' : 'object', children: [] };
    nodes.push(existing);
  }
  insertNode(existing.children, parts.slice(1), depth + 1, currentPath);
}

export default MappingEditorPage;
