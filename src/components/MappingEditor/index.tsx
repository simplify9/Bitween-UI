import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import {
  MappingEditorProvider,
  useMappingEditorState,
  useMappingEditorDispatch,
  generateFromTargetJson,
  openArrayModal,
  setInputJson,
  setOutputJson,
  setSearchInput,
  setSearchOutput,
  togglePreview,
} from './context/MappingEditorContext';
import {
  buildTree,
  flattenLeafPaths,
  tryParseJson,
  TreeNode,
} from 'src/utils/mappingPreview';
import SourceTree from './SourceTree';
import OutputTree from './OutputTree/OutputTree';
import ConnectionCanvas from './ConnectionCanvas';
import ManualEditor from './ManualEditor';
import LivePreview from './LivePreview';
import ArrayMappingModal from './ArrayMappingModal/ArrayMappingModal';
import MappingEditorToolbar from './MappingEditorToolbar';
import { buildMappingTree, getFullTargetPrefix } from 'src/utils/mappingTreeUtils';
import { useMappingEditorLoader } from './useMappingEditorLoader';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSave } from './useSave';

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
    searchInput,
    searchOutput,
  } = useMappingEditorState();
  const { id } = useParams<{ id: string }>();
  const subscriptionId = Number(id);

  // ── Hooks ───────────────────────────────────────────────────────────────────
  useMappingEditorLoader(subscriptionId);
  const { isSaving, saveSuccess, handleValidate, handleSave, handleModeChange } = useSave(subscriptionId);
  useKeyboardShortcuts(() => void handleSave());

  const [jsonAreaHeight, setJsonAreaHeight] = useState(96); // px — both panels share this
  const srcTextareaRef = useRef<HTMLTextAreaElement>(null);
  const tgtTextareaRef = useRef<HTMLTextAreaElement>(null);

  const syncHeight = useCallback((from: 'src' | 'tgt') => {
    const el = from === 'src' ? srcTextareaRef.current : tgtTextareaRef.current;
    if (!el) return;
    setJsonAreaHeight(el.offsetHeight);
  }, []);

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
      ? (Array.isArray(outputObj)
          // Root-array output schema: always include the '[*]' container node.
          // buildTree returns no children for primitive arrays (e.g. [1,2,3]),
          // so the tree shows just `root []` with the + fixed button.
          ? ['[*]', ...buildTree(outputObj).flatMap(flattenLeafPaths).map((p) => `[*].${p}`)]
          : buildTree(outputObj).flatMap(flattenLeafPaths))
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
      if (am.isRootOutput) {
        // Root-output AM has no named target — its container path is '[*]'
        if (!paths.includes('[*]')) paths.push('[*]');
        for (const m of am.mappings) {
          if (m.target) paths.push(`[*].${m.target}`);
        }
        continue;
      }
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
        (m) =>
          m.target &&
          (Boolean(m.source) ||
            m.fixedValue !== undefined ||
            Boolean(m.partnerPropKey) ||
            Boolean(m.globalSetId && m.globalKey))
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
