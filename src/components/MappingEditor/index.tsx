import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
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
import { ArrayMapping, NATIVE_JSON_MAPPER_ID, ValidationError } from './types';
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
import { generateScriban, parseScriban, resolveParentArrayIds } from 'src/utils/scribanGenerator';
import { useValuesSetMap } from 'src/hooks/useValuesSetMap';
import MappingEditorToolbar from './MappingEditorToolbar';
import { buildMappingTree, getFullTargetPrefix } from './mappingTreeUtils';

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
    editingArrayId,
    manualTemplate,
    isManualDirty,
    searchInput,
    searchOutput,
    selectedPartnerId,
  } = useMappingEditorState();
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);

  // ── Data loading ────────────────────────────────────────────────────────────
  const { data: subscriptionData } = useSubscriptionQuery(subscriptionId, { skip: !subscriptionId, refetchOnMountOrArgChange: true });
  const [saveMapper, { isLoading: isSaving }] = useSaveMapperMutation();
  const [loadedForId, setLoadedForId] = useState<number | null>(null);
  const pendingIdRef = useRef<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jsonAreaHeight, setJsonAreaHeight] = useState(96); // px — both panels share this
  const srcTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tgtTextareaRef = useRef<HTMLTextAreaElement>(null);
  // Global adapter values sets — used for enum lookup in live preview + template generation
  const valuesSetMap = useValuesSetMap();
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
        const now = Date.now();
        const rawAMs = parsed.arrayMappings.map((am, i) => ({
          id: `parsed-am-${i}-${now}`,
          ...am,
          mappings: am.mappings.map((m, j) => ({
            id: `parsed-am-${i}-${j}-${now}`,
            ...m,
          })),
        }));
        dispatch(setArrayMappings(resolveParentArrayIds(rawAMs)));
      } else if (newMode === 'manual') {
        // Entering Manual — always regenerate template from current Redux state
        dispatch(syncManualTemplate(generateScriban(fieldMappings, arrayMappings, valuesSetMap, outputJson)));
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
      const fullPrefix = getFullTargetPrefix(am.id, arrayMappings);
      const containerPath = `${fullPrefix}[*]`;
      if (!paths.includes(containerPath)) paths.push(containerPath);
      for (const m of am.mappings) {
        if (m.target) paths.push(`${fullPrefix}[*].${m.target}`);
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
        (m) => m.target && (Boolean(m.source) || m.fixedValue !== undefined || Boolean(m.partnerPropKey))
      ).length,
    [fieldMappings]
  );

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
      if (!m.source && m.fixedValue === undefined && !m.partnerPropKey && !(m.globalSetId && m.globalKey)) {
        errors.push({
          type: 'warning',
          message: `"${m.target}" has no assigned source, fixed value, partner property, or global variable`,
          path: m.target,
        });
      }
    }
    for (const am of arrayMappings) {
      if (!am.source && !am.fixedItems?.length) errors.push({ type: 'error', message: `Array mapping missing source path` });
      if (!am.target) errors.push({ type: 'error', message: `Array mapping missing target path` });
      if (am.mappings.length === 0 && !am.fixedItems?.length) {
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
        : generateScriban(fieldMappings, arrayMappings, valuesSetMap, outputJson, inputJson);

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
    if (selectedPartnerId != null) {
      mapperProperties.push({ key: 'PartnerId', value: String(selectedPartnerId) });
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
    selectedPartnerId,
    saveMapper,
  ]);

  const handleSave = useCallback(async () => {
    handleValidate();
    await persistSave();
  }, [handleValidate, persistSave]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isVisualMode = mode === 'visual';
  const isManualMode = mode === 'manual';

  return (
    <div className="fixed inset-0 z-[40] bg-white flex flex-col overflow-hidden">
      <MappingEditorToolbar
        subscriptionId={subscriptionId}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        handleModeChange={handleModeChange}
        handleValidate={handleValidate}
        handleSave={() => void handleSave()}
      />

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
    </div>
  );
};

export default MappingEditorPage;
