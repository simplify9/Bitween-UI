import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTypedSelector, useAppDispatch } from 'src/state/ReduxSotre';
import {
  addFieldMapping,
  removeFieldMapping,
  selectMapping,
} from 'src/state/stateSlices/mappingEditor';
import { TreeNode, buildTree, tryParseJson } from 'src/utils/mappingPreview';

// ─── Custom node types ────────────────────────────────────────────────────────

const SourceFieldNode: React.FC<NodeProps> = ({ data }) => (
  <div
    className={[
      'px-3 py-1.5 rounded-lg border text-xs font-mono shadow-sm bg-white',
      (data as any).isMapped ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200',
    ].join(' ')}
    style={{ minWidth: 160, maxWidth: 220 }}
  >
    <div className="flex items-center gap-1.5">
      <span
        className={[
          'w-2 h-2 rounded-full flex-shrink-0',
          (data as any).isMapped ? 'bg-emerald-400' : 'bg-gray-300',
        ].join(' ')}
      />
      <span className="truncate text-gray-700">{(data as any).label as string}</span>
      {(data as any).nodeType === 'array' && (
        <span className="text-blue-500 ml-0.5 flex-shrink-0">[]</span>
      )}
    </div>
    <Handle type="source" position={Position.Right} style={{ background: '#3b82f6' }} />
  </div>
);

const TargetFieldNode: React.FC<NodeProps> = ({ data }) => (
  <div
    className={[
      'px-3 py-1.5 rounded-lg border text-xs font-mono shadow-sm bg-white',
      (data as any).isMapped ? 'border-emerald-400 bg-emerald-50' : 'border-rose-200 bg-rose-50',
    ].join(' ')}
    style={{ minWidth: 160, maxWidth: 220 }}
  >
    <Handle type="target" position={Position.Left} style={{ background: '#10b981' }} />
    <div className="flex items-center gap-1.5">
      <span
        className={[
          'w-2 h-2 rounded-full flex-shrink-0',
          (data as any).isMapped ? 'bg-emerald-400' : 'bg-rose-300',
        ].join(' ')}
      />
      <span className="truncate text-gray-700">{(data as any).label as string}</span>
    </div>
  </div>
);

const nodeTypes = {
  sourceField: SourceFieldNode,
  targetField: TargetFieldNode,
};

// ─── Layout helpers ───────────────────────────────────────────────────────────

const X_SOURCE = 60;
const X_TARGET = 500;
const Y_START = 40;
const Y_STEP = 44;

function flattenTree(nodes: TreeNode[], depth = 0): { node: TreeNode; depth: number }[] {
  const result: { node: TreeNode; depth: number }[] = [];
  for (const n of nodes) {
    result.push({ node: n, depth });
    if (n.type !== 'leaf' && n.children.length) {
      result.push(...flattenTree(n.children, depth + 1));
    }
  }
  return result;
}

// ─── FlowCanvas ───────────────────────────────────────────────────────────────

const FlowCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const inputJson = useTypedSelector((s) => s.mappingEditor.inputJson);
  const outputJson = useTypedSelector((s) => s.mappingEditor.outputJson);
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const selectedId = useTypedSelector((s) => s.mappingEditor.selectedMappingId);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const inputObj = tryParseJson(inputJson);
    const outputObj = tryParseJson(outputJson);

    const sourceTree = inputObj ? buildTree(inputObj) : [];
    const targetTree = outputObj ? buildTree(outputObj) : [];

    const sourceFlatList = flattenTree(sourceTree);
    const targetFlatList = flattenTree(targetTree);

    const mappedSources = new Set(fieldMappings.map((m) => m.source));
    const mappedTargets = new Set(fieldMappings.map((m) => m.target));

    // Also mark array mapping source/target paths as mapped
    for (const am of arrayMappings) {
      mappedSources.add(am.source);
      mappedTargets.add(am.target);
      for (const m of am.mappings) {
        if (m.source) mappedSources.add(`${am.source}[*].${m.source}`);
        if (m.target) mappedTargets.add(`${am.target}[*].${m.target}`);
      }
    }

    const sourceNodes: Node[] = sourceFlatList.map(({ node, depth }, idx) => ({
      id: `src::${node.path}`,
      type: 'sourceField',
      position: { x: X_SOURCE + depth * 20, y: Y_START + idx * Y_STEP },
      data: {
        label: node.key,
        path: node.path,
        nodeType: node.type,
        isMapped: mappedSources.has(node.path),
      },
      draggable: true,
    }));

    const targetNodes: Node[] = targetFlatList.map(({ node, depth }, idx) => ({
      id: `tgt::${node.path}`,
      type: 'targetField',
      position: { x: X_TARGET + depth * 20, y: Y_START + idx * Y_STEP },
      data: {
        label: node.key,
        path: node.path,
        nodeType: node.type,
        isMapped: mappedTargets.has(node.path),
      },
      draggable: true,
    }));

    const edges: Edge[] = [
      // ── Regular field mapping edges ───────────────────────────────────────
      ...fieldMappings
        .filter((m) => m.source && m.target)
        .map((m) => ({
          id: m.id,
          source: `src::${m.source}`,
          target: `tgt::${m.target}`,
          type: 'smoothstep',
          animated: false,
          selected: selectedId === m.id,
          style: {
            stroke: selectedId === m.id ? '#3b82f6' : '#94a3b8',
            strokeWidth: selectedId === m.id ? 2 : 1.5,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: selectedId === m.id ? '#3b82f6' : '#94a3b8' },
          data: { mappingId: m.id },
        })),

      // ── Array mapping edges (violet) ──────────────────────────────────────
      ...arrayMappings.flatMap((am) => [
        // Container-level: items → products
        ...(am.source && am.target
          ? [{
              id: `am-container-${am.id}`,
              source: `src::${am.source}`,
              target: `tgt::${am.target}`,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '6 3' },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
              label: am.alias ?? 'loop',
              labelStyle: { fontSize: 10, fill: '#8b5cf6' },
              data: {},
            }]
          : []),
        // Inner field edges: items[*].productId → products[*].sku
        ...am.mappings
          .filter((m) => m.source && m.target)
          .map((m) => ({
            id: `am-field-${am.id}-${m.id}`,
            source: `src::${am.source}[*].${m.source}`,
            target: `tgt::${am.target}[*].${m.target}`,
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
            data: {},
          })),
      ]),
    ];

    setFlowNodes([...sourceNodes, ...targetNodes]);
    setFlowEdges(edges);
  }, [inputJson, outputJson, fieldMappings, arrayMappings, selectedId]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourcePath = connection.source?.replace('src::', '');
      const targetPath = connection.target?.replace('tgt::', '');
      if (sourcePath && targetPath) {
        dispatch(addFieldMapping({ source: sourcePath, target: targetPath }));
      }
    },
    [dispatch]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      dispatch(selectMapping(edge.id));
    },
    [dispatch]
  );

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      dispatch(removeFieldMapping(edge.id));
    },
    [dispatch]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
        <Controls />
        <MiniMap nodeStrokeWidth={3} nodeColor={(n) => ((n.data as any).isMapped ? '#10b981' : '#e2e8f0')} />
      </ReactFlow>
      <div className="absolute bottom-14 left-2 text-xs text-gray-400 bg-white/80 rounded px-2 py-1 shadow">
        Drag from source → target to connect • Double-click edge to remove
      </div>
    </div>
  );
};

export default FlowCanvas;
