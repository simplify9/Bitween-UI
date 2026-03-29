import React, { useState, useCallback } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { HiOutlineTrash, HiPlusCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { KeyValuePair } from "src/types/common";

// ─── Tree Types ───────────────────────────────────────────────────────────────

type SourceNode = {
    key: string;
    path: string;
    type: "leaf" | "object" | "array";
    value?: any;
    itemCount?: number;
    children: SourceNode[];
};

type OutputNode = {
    key: string;
    path: string;
    type: "leaf" | "object" | "array";
    row?: MappingRow;
    children: OutputNode[];
};

// ─── Types ────────────────────────────────────────────────────────────────────

export const NATIVE_JSON_MAPPER_ID = "NativeJsonFieldMapper";

type MappingRow = { id: string; outputField: string; sourcePath: string; fixedValue?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenPaths(obj: any, prefix = ""): string[] {
    if (typeof obj !== "object" || obj === null) {
        return prefix ? [prefix] : [];
    }
    if (Array.isArray(obj)) {
        if (obj.length === 0 || typeof obj[0] !== "object" || obj[0] === null || Array.isArray(obj[0])) {
            return prefix ? [prefix] : [];
        }
        return flattenPaths(obj[0], `${prefix}[*]`);
    }
    return Object.entries(obj).flatMap(([k, v]) => {
        const path = prefix ? `${prefix}.${k}` : k;
        return flattenPaths(v, path);
    });
}

function getByPath(obj: any, path: string): any {
    return path.split(".").reduce((acc: any, k: string) => acc?.[k], obj);
}

function setByPath(result: any, path: string, value: any): void {
    const keys = path.split(".");
    let node = result;
    for (let i = 0; i < keys.length - 1; i++) {
        if (typeof node[keys[i]] !== "object" || node[keys[i]] === null) {
            node[keys[i]] = {};
        }
        node = node[keys[i]];
    }
    node[keys[keys.length - 1]] = value;
}

function buildOutput(rows: MappingRow[], sourceObj: any): any {
    const result: any = {};

    const validRows = rows.filter(r => r.outputField.trim());

    // Fixed-value scalar rules
    for (const row of validRows.filter(r => r.fixedValue !== undefined && !r.outputField.includes("[*]"))) {
        setByPath(result, row.outputField, row.fixedValue ?? null);
    }

    const scalarRows = validRows.filter(r => r.fixedValue === undefined && !r.outputField.includes("[*]") && !r.sourcePath.includes("[*]"));
    const arrayRows  = validRows.filter(r => r.fixedValue === undefined && (r.outputField.includes("[*]") || r.sourcePath.includes("[*]")));
    const fixedArrayRows = validRows.filter(r => r.fixedValue !== undefined && r.outputField.includes("[*]"));

    for (const row of scalarRows) {
        const value = row.sourcePath ? getByPath(sourceObj, row.sourcePath) : undefined;
        setByPath(result, row.outputField, value ?? null);
    }

    const groups = new Map<string, MappingRow[]>();
    for (const row of arrayRows) {
        if (!row.sourcePath) continue;
        const sourcePrefix = row.sourcePath.split("[*]")[0].replace(/\.$/, "");
        const outputPrefix = row.outputField.split("[*]")[0].replace(/\.$/, "");
        const key = `${sourcePrefix}|||${outputPrefix}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
    }

    const fixedArrayByOutputPrefix = new Map<string, MappingRow[]>();
    for (const row of fixedArrayRows) {
        const outputPrefix = row.outputField.split("[*]")[0].replace(/\.$/, "");
        if (!fixedArrayByOutputPrefix.has(outputPrefix)) fixedArrayByOutputPrefix.set(outputPrefix, []);
        fixedArrayByOutputPrefix.get(outputPrefix)!.push(row);
    }

    for (const [key, groupRows] of groups) {
        const [sourcePrefix, outputPrefix] = key.split("|||");
        const sourceArray = getByPath(sourceObj, sourcePrefix);
        if (!Array.isArray(sourceArray)) continue;

        const groupFixed = fixedArrayByOutputPrefix.get(outputPrefix) ?? [];

        const outputArray = sourceArray.map((item: any) => {
            const outputItem: any = {};
            for (const row of groupFixed) {
                const outParts = row.outputField.split("[*].");
                if (outParts.length >= 2) setByPath(outputItem, outParts[1], row.fixedValue ?? null);
            }
            for (const row of groupRows) {
                const srcParts = row.sourcePath.split("[*].");
                const outParts = row.outputField.split("[*].");
                if (srcParts.length < 2 || outParts.length < 2) continue;
                const value = getByPath(item, srcParts[1]);
                setByPath(outputItem, outParts[1], value ?? null);
            }
            return outputItem;
        });

        setByPath(result, outputPrefix, outputArray);
        fixedArrayByOutputPrefix.delete(outputPrefix);
    }

    // Fixed-value-only array rows with no source-mapped counterpart — single placeholder item
    for (const [outputPrefix, fixedRows] of fixedArrayByOutputPrefix) {
        const outputItem: any = {};
        for (const row of fixedRows) {
            const outParts = row.outputField.split("[*].");
            if (outParts.length >= 2) setByPath(outputItem, outParts[1], row.fixedValue ?? null);
        }
        setByPath(result, outputPrefix, [outputItem]);
    }

    return result;
}

function normalize(s: string): string {
    return s.toLowerCase().replace(/[._\-\s]/g, "");
}

function autoMatch(outputField: string, sourcePaths: string[]): string {
    const lastSegment = outputField.split(".").pop() ?? outputField;
    const normTarget = normalize(lastSegment);
    return sourcePaths.find((p) => normalize(p.split(".").pop() ?? p) === normTarget) ?? "";
}

function tryParseJson(text: string): any | null {
    try { return JSON.parse(text); } catch { return null; }
}

function loadRowsFromProperties(mapperProperties: KeyValuePair[] | undefined): MappingRow[] {
    if (!mapperProperties) return [];
    const rulesEntry = mapperProperties.find(p => p.key === "Rules");
    if (!rulesEntry?.value) return [];
    const parsed = tryParseJson(rulesEntry.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: any, i: number) => ({
        id: `row-loaded-${i}`,
        outputField: r.outputField ?? r.OutputField ?? "",
        sourcePath: r.sourcePath ?? r.SourcePath ?? "",
        fixedValue: r.fixedValue ?? r.FixedValue ?? undefined,
    }));
}

let rowCounter = 0;
const newRowId = () => `row-${++rowCounter}`;

// ─── Tree Builders ────────────────────────────────────────────────────────────

function buildSourceTree(obj: any, keyName = "", prefix = ""): SourceNode[] {
    if (obj === null || obj === undefined) {
        return keyName ? [{ key: keyName, path: prefix, type: "leaf", value: null, children: [] }] : [];
    }
    if (Array.isArray(obj)) {
        if (obj.length === 0 || typeof obj[0] !== "object" || obj[0] === null) {
            return keyName ? [{ key: keyName, path: prefix, type: "leaf", value: obj, children: [] }] : [];
        }
        const children = Object.entries(obj[0] as object).flatMap(([k, v]) => {
            const childPath = prefix ? `${prefix}[*].${k}` : k;
            return buildSourceTree(v, k, childPath);
        });
        return keyName
            ? [{ key: keyName, path: prefix, type: "array", itemCount: obj.length, children }]
            : children;
    }
    if (typeof obj === "object") {
        const entries = Object.entries(obj as object).flatMap(([k, v]) => {
            const childPath = prefix ? `${prefix}.${k}` : k;
            return buildSourceTree(v, k, childPath);
        });
        if (!keyName) return entries;
        return [{ key: keyName, path: prefix, type: "object", children: entries }];
    }
    return keyName ? [{ key: keyName, path: prefix, type: "leaf", value: obj, children: [] }] : [];
}

function getLeafPaths(node: SourceNode): string[] {
    if (node.type === "leaf") return [node.path];
    return node.children.flatMap(getLeafPaths);
}

function insertOutputRow(children: OutputNode[], pathParts: string[], pathSoFar: string, row: MappingRow) {
    if (pathParts.length === 0) return;
    const rawPart = pathParts[0];
    const isArray = rawPart.includes("[*]");
    const key = rawPart.replace("[*]", "");
    const nodePath = pathSoFar ? `${pathSoFar}.${rawPart}` : rawPart;
    const remaining = pathParts.slice(1);
    const existingNode = children.find(n => n.key === key);
    if (remaining.length === 0) {
        if (existingNode) {
            existingNode.row = row;
        } else {
            children.push({ key, path: row.outputField, type: "leaf", row, children: [] });
        }
        return;
    }
    if (existingNode) {
        insertOutputRow(existingNode.children, remaining, nodePath, row);
    } else {
        const newNode: OutputNode = { key, path: nodePath, type: isArray ? "array" : "object", children: [] };
        children.push(newNode);
        insertOutputRow(newNode.children, remaining, nodePath, row);
    }
}

function buildOutputTree(rows: MappingRow[]): OutputNode[] {
    const root: OutputNode[] = [];
    for (const row of rows) {
        if (!row.outputField.trim()) continue;
        const parts = row.outputField.split(".");
        insertOutputRow(root, parts, "", row);
    }
    return root;
}

// ─── SourceLeaf ───────────────────────────────────────────────────────────────

const SourceLeaf: React.FC<{
    node: SourceNode;
    isAssigned: boolean;
    hasFocused: boolean;
    isOverlay?: boolean;
    onClickAssign?: (path: string) => void;
}> = ({ node, isAssigned, hasFocused, isOverlay = false, onClickAssign }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: node.path });
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            title={node.path}
            onClick={(e) => { e.stopPropagation(); if (hasFocused) onClickAssign?.(node.path); }}
            className={[
                "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono select-none transition",
                isOverlay ? "cursor-grabbing shadow-xl bg-primary-600 text-white scale-105 z-50" : "cursor-grab",
                isDragging && !isOverlay ? "opacity-30" : "",
                !isOverlay && isAssigned ? "text-green-700" : "text-gray-700",
                !isOverlay && hasFocused ? "hover:bg-primary-50 hover:text-primary-700 cursor-pointer" : "",
            ].filter(Boolean).join(" ")}
        >
            <span className={["w-2 h-2 rounded-full flex-shrink-0", isAssigned ? "bg-green-400" : "bg-gray-300"].join(" ")} />
            <span className="truncate">{node.key}</span>
        </div>
    );
};

// ─── SourceBranch ─────────────────────────────────────────────────────────────

const SourceBranch: React.FC<{
    node: SourceNode;
    assignedPaths: Set<string>;
    hasFocused: boolean;
    onClickAssign?: (path: string) => void;
}> = ({ node, assignedPaths, hasFocused, onClickAssign }) => {
    const [open, setOpen] = useState(true);
    const leaves = getLeafPaths(node);
    const assignedCount = leaves.filter(p => assignedPaths.has(p)).length;
    return (
        <div>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 w-full text-left px-2 py-1 rounded hover:bg-gray-100 transition"
            >
                <span className="text-gray-400 text-xs">{open ? "▾" : "▸"}</span>
                <span className="text-xs font-medium text-gray-600 font-mono">{node.key}</span>
                {node.type === "array" && (
                    <span className="text-xs text-gray-400 font-mono ml-0.5">[{node.itemCount ?? "*"}]</span>
                )}
                <span className={["ml-auto text-xs px-1 rounded", assignedCount === leaves.length && leaves.length > 0 ? "text-green-600" : "text-gray-400"].join(" ")}>
                    {assignedCount}/{leaves.length}
                </span>
            </button>
            {open && (
                <div className="pl-3 border-l border-gray-100 ml-3">
                    {node.children.map(child =>
                        child.type === "leaf"
                            ? <SourceLeaf
                                key={child.path}
                                node={child}
                                isAssigned={assignedPaths.has(child.path)}
                                hasFocused={hasFocused}
                                onClickAssign={onClickAssign}
                            />
                            : <SourceBranch
                                key={child.path}
                                node={child}
                                assignedPaths={assignedPaths}
                                hasFocused={hasFocused}
                                onClickAssign={onClickAssign}
                            />
                    )}
                </div>
            )}
        </div>
    );
};

// ─── OutputLeaf ───────────────────────────────────────────────────────────────

const OutputLeaf: React.FC<{
    node: OutputNode;
    isFocused: boolean;
    onFocus: (id: string) => void;
    onRemove: (id: string) => void;
    onChangeSource: (id: string, val: string) => void;
    onChangeFixed: (id: string, val: string | undefined) => void;
    sourcePaths: string[];
}> = ({ node, isFocused, onFocus, onRemove, onChangeSource, onChangeFixed, sourcePaths }) => {
    const row = node.row!;
    const { setNodeRef, isOver } = useDroppable({ id: `drop-${row.id}` });
    const isFixed = row.fixedValue !== undefined;
    const isAssigned = isFixed ? row.fixedValue !== "" : Boolean(row.sourcePath);

    const toggleMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFixed) {
            onChangeFixed(row.id, undefined);
        } else {
            onChangeSource(row.id, "");
            onChangeFixed(row.id, "");
        }
    };

    return (
        <div
            ref={setNodeRef}
            onClick={() => onFocus(row.id)}
            className={[
                "flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition text-xs",
                isFocused ? "border-primary-400 ring-2 ring-primary-200 bg-primary-50" : "border-gray-200 hover:border-gray-300 bg-white",
                isOver ? "!border-primary-400 !bg-primary-50" : "",
            ].filter(Boolean).join(" ")}
        >
            <span className={["w-2 h-2 rounded-full flex-shrink-0", isAssigned ? "bg-green-400" : "bg-red-300"].join(" ")} />
            <span className="font-mono text-gray-700 truncate flex-shrink-0">{node.key}</span>
            <span className="text-gray-300 mx-0.5 flex-shrink-0">←</span>
            <button
                title={isFixed ? "Switch to source field" : "Switch to fixed value"}
                onClick={toggleMode}
                className={[
                    "flex-shrink-0 text-xs font-mono px-1.5 py-0.5 rounded border transition",
                    isFixed
                        ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                        : "border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500",
                ].join(" ")}
            >
                {isFixed ? "fx" : "src"}
            </button>
            {isFixed ? (
                <input
                    className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-orange-600 min-w-0 placeholder-orange-300"
                    placeholder="fixed value…"
                    value={row.fixedValue ?? ""}
                    onChange={e => onChangeFixed(row.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                />
            ) : (
                <select
                    className="flex-1 border-0 bg-transparent font-mono text-xs focus:outline-none text-gray-500 min-w-0"
                    value={row.sourcePath}
                    onChange={e => onChangeSource(row.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                >
                    <option value="">— unassigned —</option>
                    {sourcePaths.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            )}
            <button
                className="text-gray-300 hover:text-red-500 transition flex-shrink-0"
                onClick={e => { e.stopPropagation(); onRemove(row.id); }}
            >
                <HiOutlineTrash size={13} />
            </button>
        </div>
    );
};

// ─── OutputBranch ─────────────────────────────────────────────────────────────

type TreeCallbacks = {
    focusedId: string | null;
    onFocus: (id: string) => void;
    onRemove: (id: string) => void;
    onChangeSource: (id: string, val: string) => void;
    onChangeFixed: (id: string, val: string | undefined) => void;
    onAddField: (fullPath: string) => void;
    sourcePaths: string[];
};

const OutputBranch: React.FC<{
    node: OutputNode;
    callbacks: TreeCallbacks;
}> = ({ node, callbacks }) => {
    const [open, setOpen] = useState(true);
    const [addName, setAddName] = useState("");
    const [adding, setAdding] = useState(false);

    const handleAdd = () => {
        if (!addName.trim()) return;
        const isArrayNode = node.type === "array";
        const fieldPath = isArrayNode
            ? `${node.path.replace(/\[\*\]$/, "")}[*].${addName.trim()}`
            : `${node.path}.${addName.trim()}`;
        callbacks.onAddField(fieldPath);
        setAddName("");
        setAdding(false);
    };

    return (
        <div>
            <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 group">
                <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 flex-1 text-left">
                    <span className="text-gray-400 text-xs">{open ? "▾" : "▸"}</span>
                    <span className="text-xs font-medium text-gray-700 font-mono">{node.key}</span>
                    {node.type === "array" && <span className="text-xs text-blue-500 font-mono ml-0.5">[]</span>}
                    {node.type === "object" && <span className="text-xs text-gray-400 font-mono ml-0.5">{"{}"}</span>}
                </button>
                <button
                    onClick={() => setAdding(a => !a)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-500 transition"
                    title="Add field"
                >
                    <HiPlusCircle size={14} />
                </button>
            </div>
            {adding && (
                <div className="flex items-center gap-1 px-5 py-1">
                    <input
                        autoFocus
                        className="border rounded px-2 py-0.5 text-xs font-mono flex-1 focus:outline-none focus:border-primary-400"
                        placeholder="fieldName"
                        value={addName}
                        onChange={e => setAddName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                    />
                    <button onClick={handleAdd} className="text-xs text-primary-600 font-medium px-2">Add</button>
                    <button onClick={() => setAdding(false)} className="text-xs text-gray-400 px-1">✕</button>
                </div>
            )}
            {open && (
                <div className="pl-3 border-l border-gray-100 ml-3">
                    {node.children.map(child =>
                        child.type === "leaf"
                            ? <OutputLeaf
                                key={child.row?.id ?? child.key}
                                node={child}
                                isFocused={callbacks.focusedId === child.row?.id}
                                onFocus={callbacks.onFocus}
                                onRemove={callbacks.onRemove}
                                onChangeSource={callbacks.onChangeSource}
                                onChangeFixed={callbacks.onChangeFixed}
                                sourcePaths={callbacks.sourcePaths}
                            />
                            : <OutputBranch
                                key={child.path}
                                node={child}
                                callbacks={callbacks}
                            />
                    )}
                </div>
            )}
        </div>
    );
};

// ─── MappingEditor ────────────────────────────────────────────────────────────

interface Props {
    mapperId?: string;
    mapperProperties?: KeyValuePair[];
    onSave: (mapperId: string, mapperProperties: KeyValuePair[]) => void;
    onClose: () => void;
}

const MappingEditor: React.FC<Props> = ({ mapperProperties, onSave, onClose }) => {
    const [rows, setRows] = useState<MappingRow[]>(() => loadRowsFromProperties(mapperProperties));
    const [sourceText, setSourceText] = useState(() => mapperProperties?.find(p => p.key === "SourceJson")?.value ?? "");
    const [sourceObj, setSourceObj] = useState<any>(() => {
        const saved = mapperProperties?.find(p => p.key === "SourceJson")?.value;
        return saved ? tryParseJson(saved) : null;
    });
    const [targetText, setTargetText] = useState(() => mapperProperties?.find(p => p.key === "TargetJson")?.value ?? "");
    const [targetError, setTargetError] = useState("");
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [rootAddName, setRootAddName] = useState("");
    const [rootAdding, setRootAdding] = useState(false);

    const sourcePaths = sourceObj ? flattenPaths(sourceObj) : [];
    const sourceTree = sourceObj ? buildSourceTree(sourceObj) : [];
    const outputTree = buildOutputTree(rows);
    const assignedPaths = new Set(rows.map(r => r.sourcePath).filter(Boolean));
    const focusedRow = rows.find(r => r.id === focusedId);

    const handleSourceChange = useCallback((text: string) => {
        setSourceText(text);
        setSourceObj(tryParseJson(text));
    }, []);

    const updateRow = useCallback((id: string, patch: Partial<MappingRow>) => {
        setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
    }, []);

    const updateFixed = useCallback((id: string, val: string | undefined) => {
        setRows(rs => rs.map(r => r.id === id ? { ...r, fixedValue: val } : r));
    }, []);

    const removeRow = useCallback((id: string) => {
        setRows(rs => rs.filter(r => r.id !== id));
        setFocusedId(fi => fi === id ? null : fi);
    }, []);

    const addRowAtPath = useCallback((outputFieldPath: string) => {
        const id = newRowId();
        const src = autoMatch(outputFieldPath, sourcePaths);
        setRows(rs => [...rs, { id, outputField: outputFieldPath, sourcePath: src }]);
        setFocusedId(id);
    }, [sourcePaths]);

    const handleDragStart = useCallback((e: DragStartEvent) => {
        setDragging(String(e.active.id));
    }, []);

    const handleDragEnd = useCallback((e: DragEndEvent) => {
        setDragging(null);
        if (!e.over) return;
        const rowId = String(e.over.id).replace("drop-", "");
        updateRow(rowId, { sourcePath: String(e.active.id) });
    }, [updateRow]);

    const handleSourceClick = useCallback((path: string) => {
        if (!focusedId) return;
        updateRow(focusedId, { sourcePath: path });
    }, [focusedId, updateRow]);

    const handleGenerateFromTarget = () => {
        const parsed = tryParseJson(targetText);
        if (!parsed) { setTargetError("Invalid JSON — check syntax and try again"); return; }
        setTargetError("");
        const paths = flattenPaths(parsed);
        setRows(paths.map(p => ({
            id: newRowId(),
            outputField: p,
            sourcePath: autoMatch(p, sourcePaths),
        })));
    };

    const handleAutoMatch = () => {
        setRows(rs => rs.map(r => ({
            ...r,
            sourcePath: r.sourcePath || autoMatch(r.outputField, sourcePaths),
        })));
    };

    const handleSave = () => {
        const validRows = rows.filter(r => r.outputField.trim());
        const rules = validRows.map(r => ({
            outputField: r.outputField,
            sourcePath: r.sourcePath,
            ...(r.fixedValue !== undefined ? { fixedValue: r.fixedValue } : {}),
        }));
        const props: KeyValuePair[] = [{ key: "Rules", value: JSON.stringify(rules) }];
        if (sourceText.trim()) props.push({ key: "SourceJson", value: sourceText });
        if (targetText.trim()) props.push({ key: "TargetJson", value: targetText });
        onSave(NATIVE_JSON_MAPPER_ID, props);
        onClose();
    };

    const handleAddRootField = () => {
        if (!rootAddName.trim()) return;
        addRowAtPath(rootAddName.trim());
        setRootAddName("");
        setRootAdding(false);
    };

    const previewOutput = sourceObj ? buildOutput(rows, sourceObj) : null;

    const treeCallbacks: TreeCallbacks = {
        focusedId,
        onFocus: setFocusedId,
        onRemove: removeRow,
        onChangeSource: (id, val) => updateRow(id, { sourcePath: val }),
        onChangeFixed: updateFixed,
        onAddField: addRowAtPath,
        sourcePaths,
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="fixed inset-0 z-50 bg-white flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">Field Mapping Editor</span>
                    {focusedRow ? (
                        <span className="text-xs text-primary-600 bg-primary-50 border border-primary-200 rounded px-2 py-0.5">
                            Editing: <span className="font-mono font-medium">{focusedRow.outputField || "—"}</span>
                            {" · "}Click a source field to assign
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">
                            Click an output field, then click a source field or drag to assign
                        </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        {sourcePaths.length > 0 && (
                            <button onClick={handleAutoMatch} className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 transition">
                                Auto-match
                            </button>
                        )}
                        <button onClick={handleSave} className="text-xs bg-primary-600 text-white rounded px-4 py-1.5 hover:bg-primary-700 transition font-medium">
                            Save Mapping
                        </button>
                        <button onClick={onClose} className="text-xs text-gray-500 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">
                    {/* ─── Source Pane ─── */}
                    <div className="w-2/5 flex flex-col overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Source JSON</span>
                        </div>
                        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Source JSON</p>
                            <textarea
                                className="w-full h-20 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:border-primary-400 bg-gray-50"
                                placeholder='{ "paste": "source JSON here" }'
                                value={sourceText}
                                onChange={e => handleSourceChange(e.target.value)}
                            />
                            {sourceText && !sourceObj && (
                                <p className="text-xs text-red-500 mt-0.5">Invalid JSON</p>
                            )}
                        </div>
                        <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Target JSON <span className="font-normal normal-case text-gray-400">(optional)</span>
                            </p>
                            <textarea
                                className="w-full h-20 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:border-primary-400 bg-gray-50"
                                placeholder='{ "paste": "desired output shape" }'
                                value={targetText}
                                onChange={e => { setTargetText(e.target.value); setTargetError(""); }}
                            />
                            {targetError && <p className="text-xs text-red-500 mt-0.5">{targetError}</p>}
                            <button
                                onClick={handleGenerateFromTarget}
                                disabled={!targetText.trim()}
                                className="mt-1.5 text-xs bg-gray-700 text-white rounded px-3 py-1 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Generate Output Structure
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto px-2 py-2">
                            {sourceTree.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center mt-8">Paste source JSON above to see the field tree</p>
                            ) : sourceTree.map(node =>
                                node.type === "leaf"
                                    ? <SourceLeaf
                                        key={node.path}
                                        node={node}
                                        isAssigned={assignedPaths.has(node.path)}
                                        hasFocused={Boolean(focusedId)}
                                        onClickAssign={handleSourceClick}
                                    />
                                    : <SourceBranch
                                        key={node.path}
                                        node={node}
                                        assignedPaths={assignedPaths}
                                        hasFocused={Boolean(focusedId)}
                                        onClickAssign={handleSourceClick}
                                    />
                            )}
                        </div>
                    </div>

                    {/* ─── Output Pane ─── */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Output Structure</span>
                            <span className="text-xs text-gray-400">
                                {rows.filter(r => r.outputField.trim()).length} fields
                                {" · "}
                                {rows.filter(r => r.outputField.trim() && r.sourcePath).length} assigned
                            </span>
                        </div>
                        <div className="flex-1 overflow-auto px-3 py-2">
                            {outputTree.map(node =>
                                node.type === "leaf"
                                    ? <OutputLeaf
                                        key={node.row?.id ?? node.key}
                                        node={node}
                                        isFocused={focusedId === node.row?.id}
                                        onFocus={setFocusedId}
                                        onRemove={removeRow}
                                        onChangeSource={(id, val) => updateRow(id, { sourcePath: val })}
                                        onChangeFixed={updateFixed}
                                        sourcePaths={sourcePaths}
                                    />
                                    : <OutputBranch
                                        key={node.path}
                                        node={node}
                                        callbacks={treeCallbacks}
                                    />
                            )}
                            {/* Add root field */}
                            <div className="mt-3">
                                {rootAdding ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            className="border rounded px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-primary-400"
                                            placeholder="e.g. Name  or  Documents[*].Code"
                                            value={rootAddName}
                                            onChange={e => setRootAddName(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter") handleAddRootField(); if (e.key === "Escape") setRootAdding(false); }}
                                        />
                                        <button onClick={handleAddRootField} className="text-xs text-primary-600 font-medium px-2">Add</button>
                                        <button onClick={() => setRootAdding(false)} className="text-xs text-gray-400 px-1">✕</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setRootAdding(true)}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition"
                                    >
                                        <HiPlusCircle size={14} /> Add field
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Preview */}
                        {previewOutput !== null && (
                            <div className="border-t border-gray-200 flex-shrink-0">
                                <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
                                    onClick={() => setPreviewOpen(o => !o)}
                                >
                                    {previewOpen ? "▾" : "▸"} Preview Output
                                    <span
                                        className="ml-auto flex items-center gap-1 text-gray-400 hover:text-gray-600"
                                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(previewOutput, null, 2)); }}
                                    >
                                        <MdOutlineContentCopy size={12} /> Copy
                                    </span>
                                </button>
                                {previewOpen && (
                                    <pre className="px-4 pb-3 text-xs font-mono text-gray-700 overflow-auto max-h-40 bg-gray-50">
                                        {JSON.stringify(previewOutput, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DragOverlay>
                {dragging && (
                    <SourceLeaf
                        node={{ key: dragging.split(".").pop() ?? dragging, path: dragging, type: "leaf", children: [] }}
                        isAssigned={false}
                        hasFocused={false}
                        isOverlay
                    />
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default MappingEditor;
