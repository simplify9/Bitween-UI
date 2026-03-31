import React, { useState, useCallback } from 'react';
import { HiOutlineTrash, HiPlusCircle } from 'react-icons/hi';
import { TreeNode } from 'src/utils/mappingPreview';
import { useAppDispatch, useTypedSelector } from 'src/state/ReduxSotre';
import {
  addFieldMapping,
  genId,
  openArrayModal,
  removeFieldMapping,
  selectMapping,
  toggleNodeCollapsed,
  updateFieldMapping,
} from 'src/state/stateSlices/mappingEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutputTreeProps {
  nodes: TreeNode[];
  sourcePaths: string[];
  onLeafRef?: (path: string, el: HTMLElement | null) => void;
}

interface OutputLeafProps {
  node: TreeNode;
  sourcePaths: string[];
  onLeafRef?: (path: string, el: HTMLElement | null) => void;
}

interface OutputBranchProps {
  node: TreeNode;
  depth?: number;
  sourcePaths: string[];
  onLeafRef?: (path: string, el: HTMLElement | null) => void;
}

// ─── OutputLeaf ───────────────────────────────────────────────────────────────

const OutputLeaf: React.FC<OutputLeafProps> = ({ node, sourcePaths, onLeafRef }) => {
  const dispatch = useAppDispatch();
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const selectedId = useTypedSelector((s) => s.mappingEditor.selectedMappingId);

  const mapping = fieldMappings.find((m) => m.target === node.path);
  const isMapped = Boolean(mapping?.source || mapping?.fixedValue !== undefined);
  const isSelected = mapping ? selectedId === mapping.id : false;

  const ref = useCallback(
    (el: HTMLElement | null) => {
      onLeafRef?.(node.path, el);
    },
    [node.path, onLeafRef]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');
    if (!sourcePath) return;
    if (mapping) {
      dispatch(updateFieldMapping({ id: mapping.id, source: sourcePath, fixedValue: undefined }));
    } else {
      dispatch(addFieldMapping({ source: sourcePath, target: node.path }));
    }
  };

  const toggleFixed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mapping) {
      dispatch(addFieldMapping({ source: '', target: node.path, fixedValue: '' }));
      return;
    }
    if (mapping.fixedValue !== undefined) {
      dispatch(updateFieldMapping({ id: mapping.id, fixedValue: undefined }));
    } else {
      dispatch(updateFieldMapping({ id: mapping.id, source: '', fixedValue: '' }));
    }
  };

  const handleSelect = () => {
    if (mapping) {
      dispatch(selectMapping(isSelected ? null : mapping.id));
    } else {
      // create an unassigned mapping and select it
      const id = genId();
      dispatch(addFieldMapping({ source: '', target: node.path }));
      // The created mapping's id is generated inside the slice, so find it after
    }
  };

  return (
    <div
      ref={ref}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleSelect}
      className={[
        'flex items-center gap-1.5 px-2 py-[3px] rounded border text-xs cursor-pointer transition-all select-none',
        isSelected
          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'w-2 h-2 rounded-full flex-shrink-0',
          isMapped ? 'bg-emerald-400' : 'bg-rose-300',
        ].join(' ')}
      />
      <span className="font-mono text-gray-700 truncate">{node.key}</span>
      <span className="text-gray-300 mx-0.5 flex-shrink-0">←</span>

      {/* Mode button: src vs fixed */}
      <button
        onClick={toggleFixed}
        title={mapping?.fixedValue !== undefined ? 'Switch to source binding' : 'Switch to fixed value'}
        className={[
          'flex-shrink-0 text-xs font-mono px-1 rounded border transition',
          mapping?.fixedValue !== undefined
            ? 'border-amber-300 bg-amber-50 text-amber-600'
            : 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500',
        ].join(' ')}
      >
        {mapping?.fixedValue !== undefined ? 'fx' : 'src'}
      </button>

      {/* Value/path display + inline edit */}
      {mapping?.fixedValue !== undefined ? (
        <input
          className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-amber-600 min-w-0 placeholder-amber-300"
          placeholder="fixed value…"
          value={mapping.fixedValue ?? ''}
          onChange={(e) => dispatch(updateFieldMapping({ id: mapping.id, fixedValue: e.target.value }))}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <select
          className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-gray-500 min-w-0"
          value={mapping?.source ?? ''}
          onChange={(e) => {
            if (mapping) {
              dispatch(updateFieldMapping({ id: mapping.id, source: e.target.value }));
            } else {
              dispatch(addFieldMapping({ source: e.target.value, target: node.path }));
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">— unassigned —</option>
          {sourcePaths.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      {/* Transform input (visible when selected + source assigned) */}
      {isSelected && mapping?.source && mapping.fixedValue === undefined && (
        <input
          className="w-24 flex-shrink-0 border border-gray-200 rounded px-1 text-xs font-mono bg-white focus:outline-none focus:border-blue-400"
          placeholder="e.g. value*1.2"
          value={mapping.transform ?? ''}
          onChange={(e) =>
            dispatch(updateFieldMapping({ id: mapping.id, transform: e.target.value || undefined }))
          }
          onClick={(e) => e.stopPropagation()}
          title="Transform expression: use 'value' to reference the source value"
        />
      )}

      {mapping && (
        <button
          className="flex-shrink-0 text-gray-300 hover:text-rose-500 transition"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeFieldMapping(mapping.id));
          }}
        >
          <HiOutlineTrash size={12} />
        </button>
      )}
    </div>
  );
};

// ─── OutputBranch ─────────────────────────────────────────────────────────────

const OutputBranch: React.FC<OutputBranchProps> = ({ node, depth = 0, sourcePaths, onLeafRef }) => {
  const dispatch = useAppDispatch();
  const collapsed = useTypedSelector((s) => s.mappingEditor.collapsedNodes.includes(`out:${node.path}`));
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const isOpen = !collapsed;
  const [adding, setAdding] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // Check if this node corresponds to an array mapping
  const arrayMapping = arrayMappings.find((am) => am.target === node.path || am.target === node.key);

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const basePath = node.type === 'array' ? node.path : node.path;
    dispatch(
      addFieldMapping({
        source: '',
        target: `${basePath}.${newFieldName.trim()}`,
      })
    );
    setNewFieldName('');
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center gap-1 px-2 py-[3px] rounded hover:bg-gray-50 group">
        <button
          onClick={() => dispatch(toggleNodeCollapsed(`out:${node.path}`))}
          className="flex items-center gap-1 flex-1 text-left"
        >
          <span className="text-gray-400 text-xs w-3 flex-shrink-0">{isOpen ? '▾' : '▸'}</span>
          <span className="text-xs font-medium text-gray-700 font-mono truncate">{node.key}</span>
          {node.type === 'array' && (
            <span className="text-xs text-blue-500 font-mono ml-0.5">[]</span>
          )}
          {node.type === 'object' && (
            <span className="text-xs text-gray-400 font-mono ml-0.5">{'{}'}</span>
          )}
        </button>

        {node.type === 'array' && (
          <button
            className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1 transition"
            onClick={() => dispatch(openArrayModal({ id: arrayMapping?.id ?? '__new__', presetTarget: node.path }))}
            title="Configure array mapping + filter"
          >
            ⚙ loop
          </button>
        )}

        <button
          onClick={() => setAdding((a) => !a)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition"
          title="Add child field"
        >
          <HiPlusCircle size={13} />
        </button>
      </div>

      {adding && (
        <div className="flex items-center gap-1 pl-6 pr-2 py-1">
          <input
            autoFocus
            className="border rounded px-2 py-0.5 text-xs font-mono flex-1 focus:outline-none focus:border-blue-400"
            placeholder="fieldName"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddField();
              if (e.key === 'Escape') setAdding(false);
            }}
          />
          <button onClick={handleAddField} className="text-xs text-blue-600 font-medium px-2">
            Add
          </button>
          <button onClick={() => setAdding(false)} className="text-xs text-gray-400 px-1">
            ✕
          </button>
        </div>
      )}

      {isOpen && (
        <div className="pl-3 border-l border-gray-100 ml-3">
          {node.children.map((child) =>
            child.type === 'leaf' ? (
              <OutputLeaf
                key={child.path}
                node={child}
                sourcePaths={sourcePaths}
                onLeafRef={onLeafRef}
              />
            ) : (
              <OutputBranch
                key={child.path}
                node={child}
                depth={depth + 1}
                sourcePaths={sourcePaths}
                onLeafRef={onLeafRef}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

// ─── OutputTree ───────────────────────────────────────────────────────────────

const OutputTree: React.FC<OutputTreeProps> = ({ nodes, sourcePaths, onLeafRef }) => {
  const dispatch = useAppDispatch();
  const [rootAdding, setRootAdding] = useState(false);
  const [rootName, setRootName] = useState('');
  const search = useTypedSelector((s) => s.mappingEditor.searchOutput);

  const handleAddRoot = () => {
    if (!rootName.trim()) return;
    dispatch(addFieldMapping({ source: '', target: rootName.trim() }));
    setRootName('');
    setRootAdding(false);
  };

  if (nodes.length === 0 && !rootAdding) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
        <div className="text-3xl mb-1 text-gray-300">{'{ }'}</div>
        <p className="text-xs text-gray-400">No output fields yet.</p>
        <button
          onClick={() => setRootAdding(true)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-3 py-1 transition"
        >
          <HiPlusCircle size={13} /> Add field
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 space-y-0.5">
      {nodes.map((node) =>
        node.type === 'leaf' ? (
          <OutputLeaf key={node.path} node={node} sourcePaths={sourcePaths} onLeafRef={onLeafRef} />
        ) : (
          <OutputBranch key={node.path} node={node} sourcePaths={sourcePaths} onLeafRef={onLeafRef} />
        )
      )}

      <div className="mt-2">
        {rootAdding ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className="border rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-blue-400"
              placeholder='e.g.  name  or  order.items[*].title'
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddRoot();
                if (e.key === 'Escape') setRootAdding(false);
              }}
            />
            <button onClick={handleAddRoot} className="text-xs text-blue-600 font-medium px-2">
              Add
            </button>
            <button onClick={() => setRootAdding(false)} className="text-xs text-gray-400 px-1">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRootAdding(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition"
          >
            <HiPlusCircle size={13} /> Add field
          </button>
        )}
      </div>
    </div>
  );
};

export default OutputTree;
