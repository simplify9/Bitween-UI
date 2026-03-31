import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiPlusCircle,
} from 'react-icons/hi';
import { MdOutlineContentCopy, MdOutlineUndo, MdOutlineRedo } from 'react-icons/md';
import { useAppDispatch, useTypedSelector } from 'src/state/ReduxSotre';
import {
  addArrayMapping,
  autoMatch,
  clearAll,
  generateFromTargetJson,
  loadEditorContext,
  NATIVE_JSON_MAPPER_ID,
  openArrayModal,
  redo,
  setInputJson,
  setMode,
  setOutputJson,
  setSearchInput,
  setSearchOutput,
  setValidationErrors,
  undo,
  ValidationError,
} from 'src/state/stateSlices/mappingEditor';
import {
  buildTree,
  flattenLeafPaths,
  tryParseJson,
  TreeNode,
} from 'src/utils/mappingPreview';
import SourceTree from './SourceTree';
import OutputTree from './OutputTree';
import ConnectionCanvas from './ConnectionCanvas';
import FlowCanvas from './FlowCanvas';
import ManualEditor from './ManualEditor';
import LivePreview from './LivePreview';
import ArrayMappingModal from './ArrayMappingModal';
import { useLazySubscriptionQuery, useUpdateSubscriptionMutation } from 'src/client/apis/subscriptionsApi';
import { KeyValuePair } from 'src/types/common';
import { generateScriban } from 'src/utils/scribanGenerator';

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

// ─── MappingEditorPage ────────────────────────────────────────────────────────

const MappingEditorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);

  const mode = useTypedSelector((s) => s.mappingEditor.mode);
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const inputJson = useTypedSelector((s) => s.mappingEditor.inputJson);
  const outputJson = useTypedSelector((s) => s.mappingEditor.outputJson);
  const showPreview = useTypedSelector((s) => s.mappingEditor.showPreview);
  const past = useTypedSelector((s) => s.mappingEditor.past);
  const future = useTypedSelector((s) => s.mappingEditor.future);
  const editingArrayId = useTypedSelector((s) => s.mappingEditor.editingArrayId);
  const manualTemplate = useTypedSelector((s) => s.mappingEditor.manualTemplate);
  const searchInput = useTypedSelector((s) => s.mappingEditor.searchInput);
  const searchOutput = useTypedSelector((s) => s.mappingEditor.searchOutput);

  // ── Data loading ────────────────────────────────────────────────────────────
  const [getSubscription] = useLazySubscriptionQuery();
  const [updateSubscription, { isLoading: isSaving }] = useUpdateSubscriptionMutation();
  const [loaded, setLoaded] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!subscriptionId || loaded) return;
    getSubscription(subscriptionId).then((res) => {
      if (res.data) {
        dispatch(
          loadEditorContext({
            subscriptionId,
            mapperId: res.data.mapperId,
            mapperProperties: res.data.mapperProperties,
          })
        );
        setLoaded(true);
      }
    });
  }, [subscriptionId]);

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

  // ── Trees ───────────────────────────────────────────────────────────────────
  const inputObj = useMemo(() => tryParseJson(inputJson), [inputJson]);
  // outputObj is only used for "Generate from JSON" — the live tree is always driven by fieldMappings
  const outputObj = useMemo(() => tryParseJson(outputJson), [outputJson]);
  const sourceTree: TreeNode[] = useMemo(
    () => (inputObj ? buildTree(inputObj) : []),
    [inputObj]
  );
  const outputTree: TreeNode[] = useMemo(() => {
    const paths: string[] = fieldMappings.map((m) => m.target).filter(Boolean);

    // Contribute array mapping targets so they appear in the output tree
    for (const am of arrayMappings) {
      if (!am.target) continue;
      // Add the array container node itself (as array type placeholder)
      const containerPath = `${am.target}[*]`;
      if (!paths.includes(containerPath)) paths.push(containerPath);
      // Add each child field mapping
      for (const m of am.mappings) {
        if (m.target) paths.push(`${am.target}[*].${m.target}`);
      }
    }

    return buildMappingTree(paths);
  }, [fieldMappings, arrayMappings]);

  const sourcePaths = useMemo(
    () => sourceTree.flatMap(flattenLeafPaths),
    [sourceTree]
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
      if (!m.source && m.fixedValue === undefined) {
        errors.push({
          type: 'warning',
          message: `"${m.target}" has no source or fixed value`,
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
  const handleSave = useCallback(async () => {
    handleValidate();
    const rules = fieldMappings
      .filter((m) => m.target.trim())
      .map((m) => ({
        outputField: m.target,
        sourcePath: m.source,
        ...(m.fixedValue !== undefined ? { fixedValue: m.fixedValue } : {}),
        ...(m.transform ? { transform: m.transform } : {}),
      }));

    const mapperProperties: KeyValuePair[] = [
      { key: 'Rules', value: JSON.stringify(rules) },
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
    if (mode === 'manual' && manualTemplate) {
      mapperProperties.push({ key: 'ScribanTemplate', value: manualTemplate });
    }

    await updateSubscription({
      id: subscriptionId,
      mapperId: NATIVE_JSON_MAPPER_ID,
      mapperProperties,
    } as any);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }, [
    fieldMappings,
    arrayMappings,
    inputJson,
    outputJson,
    mode,
    manualTemplate,
    subscriptionId,
    updateSubscription,
    handleValidate,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isVisualMode = mode === 'visual';
  const isCanvasMode = mode === 'canvas';
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
          {fieldMappings.filter((m) => m.target && m.source).length} mappings ·{' '}
          {arrayMappings.length} array loops
        </span>

        <div className="h-5 w-px bg-gray-200" />

        {/* Mode toggle */}
        <div className="flex items-center gap-1">
          <ModeTab
            active={isVisualMode}
            onClick={() => dispatch(setMode('visual'))}
            label="Visual"
            icon={<span className="text-[10px]">⛶</span>}
          />
          <ModeTab
            active={isCanvasMode}
            onClick={() => dispatch(setMode('canvas'))}
            label="Canvas"
            icon={<span className="text-[10px]">◈</span>}
          />
          <ModeTab
            active={isManualMode}
            onClick={() => dispatch(setMode('manual'))}
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
            onClick={handleSave}
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
      ) : isCanvasMode ? (
        <div className="flex-1 overflow-hidden relative">
          <FlowCanvas />
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
                className="w-full h-24 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-mono resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
                placeholder='{ "paste": "source JSON here" }'
                value={inputJson}
                onChange={(e) => dispatch(setInputJson(e.target.value))}
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
                  {fieldMappings.filter((m) => m.target && m.source).length} assigned
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
                className="w-full h-16 border border-gray-200 rounded px-2 py-1.5 text-[11px] font-mono resize-none focus:outline-none focus:border-blue-400 bg-gray-50"
                placeholder='{ "desired": "output shape" }  (optional — used to generate structure)'
                value={outputJson}
                onChange={(e) => dispatch(setOutputJson(e.target.value))}
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
                onClick={() => dispatch({ type: 'mappingEditor/togglePreview' })}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition"
              >
                {showPreview ? '▾ Hide Preview' : '▸ Show Live Preview'}
                {!showPreview && fieldMappings.length > 0 && (
                  <span className="ml-auto text-gray-400">
                    {fieldMappings.filter((m) => m.target && m.source).length} mapped
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
