import React, { createContext, useContext, useReducer } from 'react';
import { produce } from 'immer';
import { KeyValuePair } from 'src/types/common';
import { parseScriban } from 'src/utils/scribanGenerator';
import {
  ArrayMapping,
  EditorMode,
  FieldMapping,
  FilterCondition,
  FilterOperator,
  ValidationError,
  genId,
} from './types';

// ─── State ────────────────────────────────────────────────────────────────────

interface CoreState {
  fieldMappings: FieldMapping[];
  arrayMappings: ArrayMapping[];
}

export interface MappingEditorState extends CoreState {
  inputJson: string;
  outputJson: string;
  mode: EditorMode;
  manualTemplate: string;
  isManualDirty: boolean;
  selectedMappingId: string | null;
  hoveredPath: string | null;
  searchInput: string;
  searchOutput: string;
  collapsedNodes: string[];
  editingArrayId: string | null;
  newArrayPresetTarget: string;
  past: CoreState[];
  future: CoreState[];
  validationErrors: ValidationError[];
  showValidation: boolean;
  showPreview: boolean;
  subscriptionId: number | null;
  mapperId: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type MappingEditorAction =
  | { type: 'LOAD_CONTEXT'; payload: { subscriptionId: number; mapperId?: string | null; mapperProperties?: KeyValuePair[] } }
  | { type: 'SET_INPUT_JSON'; payload: string }
  | { type: 'SET_OUTPUT_JSON'; payload: string }
  | { type: 'SET_MODE'; payload: EditorMode }
  | { type: 'SET_MANUAL_TEMPLATE'; payload: string }
  | { type: 'SYNC_MANUAL_TEMPLATE'; payload: string }
  | { type: 'CLEAR_MANUAL_DIRTY' }
  | { type: 'ADD_FIELD_MAPPING'; payload: Omit<FieldMapping, 'id'> }
  | { type: 'REMOVE_FIELD_MAPPING'; payload: string }
  | { type: 'UPDATE_FIELD_MAPPING'; payload: Partial<FieldMapping> & { id: string } }
  | { type: 'SET_FIELD_MAPPINGS'; payload: FieldMapping[] }
  | { type: 'SET_ARRAY_MAPPINGS'; payload: ArrayMapping[] }
  | { type: 'ADD_ARRAY_MAPPING'; payload: Omit<ArrayMapping, 'id'> }
  | { type: 'REMOVE_ARRAY_MAPPING'; payload: string }
  | { type: 'UPDATE_ARRAY_MAPPING'; payload: Partial<ArrayMapping> & { id: string } }
  | { type: 'ADD_ARRAY_FIELD_MAPPING'; payload: { arrayId: string; mapping: Omit<FieldMapping, 'id'> } }
  | { type: 'REMOVE_ARRAY_FIELD_MAPPING'; payload: { arrayId: string; mappingId: string } }
  | { type: 'UPDATE_ARRAY_FIELD_MAPPING'; payload: { arrayId: string; mapping: Partial<FieldMapping> & { id: string } } }
  | { type: 'SELECT_MAPPING'; payload: string | null }
  | { type: 'SET_HOVERED_PATH'; payload: string | null }
  | { type: 'SET_SEARCH_INPUT'; payload: string }
  | { type: 'SET_SEARCH_OUTPUT'; payload: string }
  | { type: 'TOGGLE_NODE_COLLAPSED'; payload: string }
  | { type: 'OPEN_ARRAY_MODAL'; payload: { id: string | null; presetTarget?: string } }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'TOGGLE_VALIDATION' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_ALL' }
  | { type: 'AUTO_MATCH' }
  | { type: 'GENERATE_FROM_TARGET_JSON' };

// ─── Action creators (same API as old Redux action creators) ──────────────────

export const loadEditorContext = (p: { subscriptionId: number; mapperId?: string | null; mapperProperties?: KeyValuePair[] }): MappingEditorAction => ({ type: 'LOAD_CONTEXT', payload: p });
export const setInputJson = (p: string): MappingEditorAction => ({ type: 'SET_INPUT_JSON', payload: p });
export const setOutputJson = (p: string): MappingEditorAction => ({ type: 'SET_OUTPUT_JSON', payload: p });
export const setMode = (p: EditorMode): MappingEditorAction => ({ type: 'SET_MODE', payload: p });
export const setManualTemplate = (p: string): MappingEditorAction => ({ type: 'SET_MANUAL_TEMPLATE', payload: p });
export const syncManualTemplate = (p: string): MappingEditorAction => ({ type: 'SYNC_MANUAL_TEMPLATE', payload: p });
export const clearManualDirty = (): MappingEditorAction => ({ type: 'CLEAR_MANUAL_DIRTY' });
export const addFieldMapping = (p: Omit<FieldMapping, 'id'>): MappingEditorAction => ({ type: 'ADD_FIELD_MAPPING', payload: p });
export const removeFieldMapping = (p: string): MappingEditorAction => ({ type: 'REMOVE_FIELD_MAPPING', payload: p });
export const updateFieldMapping = (p: Partial<FieldMapping> & { id: string }): MappingEditorAction => ({ type: 'UPDATE_FIELD_MAPPING', payload: p });
export const setFieldMappings = (p: FieldMapping[]): MappingEditorAction => ({ type: 'SET_FIELD_MAPPINGS', payload: p });
export const setArrayMappings = (p: ArrayMapping[]): MappingEditorAction => ({ type: 'SET_ARRAY_MAPPINGS', payload: p });
export const addArrayMapping = (p: Omit<ArrayMapping, 'id'>): MappingEditorAction => ({ type: 'ADD_ARRAY_MAPPING', payload: p });
export const removeArrayMapping = (p: string): MappingEditorAction => ({ type: 'REMOVE_ARRAY_MAPPING', payload: p });
export const updateArrayMapping = (p: Partial<ArrayMapping> & { id: string }): MappingEditorAction => ({ type: 'UPDATE_ARRAY_MAPPING', payload: p });
export const addArrayFieldMapping = (p: { arrayId: string; mapping: Omit<FieldMapping, 'id'> }): MappingEditorAction => ({ type: 'ADD_ARRAY_FIELD_MAPPING', payload: p });
export const removeArrayFieldMapping = (p: { arrayId: string; mappingId: string }): MappingEditorAction => ({ type: 'REMOVE_ARRAY_FIELD_MAPPING', payload: p });
export const updateArrayFieldMapping = (p: { arrayId: string; mapping: Partial<FieldMapping> & { id: string } }): MappingEditorAction => ({ type: 'UPDATE_ARRAY_FIELD_MAPPING', payload: p });
export const selectMapping = (p: string | null): MappingEditorAction => ({ type: 'SELECT_MAPPING', payload: p });
export const setHoveredPath = (p: string | null): MappingEditorAction => ({ type: 'SET_HOVERED_PATH', payload: p });
export const setSearchInput = (p: string): MappingEditorAction => ({ type: 'SET_SEARCH_INPUT', payload: p });
export const setSearchOutput = (p: string): MappingEditorAction => ({ type: 'SET_SEARCH_OUTPUT', payload: p });
export const toggleNodeCollapsed = (p: string): MappingEditorAction => ({ type: 'TOGGLE_NODE_COLLAPSED', payload: p });
export const openArrayModal = (p: { id: string | null; presetTarget?: string }): MappingEditorAction => ({ type: 'OPEN_ARRAY_MODAL', payload: p });
export const togglePreview = (): MappingEditorAction => ({ type: 'TOGGLE_PREVIEW' });
export const setValidationErrors = (p: ValidationError[]): MappingEditorAction => ({ type: 'SET_VALIDATION_ERRORS', payload: p });
export const toggleValidation = (): MappingEditorAction => ({ type: 'TOGGLE_VALIDATION' });
export const undo = (): MappingEditorAction => ({ type: 'UNDO' });
export const redo = (): MappingEditorAction => ({ type: 'REDO' });
export const clearAll = (): MappingEditorAction => ({ type: 'CLEAR_ALL' });
export const autoMatch = (): MappingEditorAction => ({ type: 'AUTO_MATCH' });
export const generateFromTargetJson = (): MappingEditorAction => ({ type: 'GENERATE_FROM_TARGET_JSON' });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snapshot(state: MappingEditorState): CoreState {
  return {
    fieldMappings: state.fieldMappings.map((m) => ({ ...m })),
    arrayMappings: state.arrayMappings.map((am) => ({
      ...am,
      mappings: am.mappings.map((m) => ({ ...m })),
    })),
  };
}

function flatPathsFromObj(obj: any, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return prefix ? [prefix] : [];
  if (Array.isArray(obj)) {
    if (obj.length === 0 || typeof obj[0] !== 'object' || obj[0] === null) return prefix ? [prefix] : [];
    return flatPathsFromObj(obj[0], `${prefix}[*]`);
  }
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return flatPathsFromObj(v, path);
  });
}

export function loadFromProps(props: KeyValuePair[]): CoreState {
  const rulesEntry = props.find((p) => p.key === 'Rules');
  const scribanEntry = props.find((p) => p.key === 'ScribanTemplate');
  const arrayEntry = props.find((p) => p.key === 'ArrayRules');
  const fieldMappings: FieldMapping[] = [];
  const arrayMappings: ArrayMapping[] = [];

  if (rulesEntry?.value) {
    try {
      const parsed = JSON.parse(rulesEntry.value);
      if (Array.isArray(parsed)) {
        parsed.forEach((r: any, i: number) => {
          fieldMappings.push({
            id: `loaded-${i}`,
            source: r.sourcePath ?? r.SourcePath ?? '',
            target: r.outputField ?? r.OutputField ?? '',
            transform: r.transform ?? r.Transform ?? undefined,
            fixedValue: r.fixedValue ?? r.FixedValue ?? undefined,
            valuesSetId: r.valuesSetId ?? r.ValuesSetId ?? undefined,
          });
        });
      }
    } catch {}
  } else if (scribanEntry?.value && scribanEntry.value !== '{}') {
    try {
      const parsed = parseScriban(scribanEntry.value);
      parsed.fieldMappings.forEach((m, i) => {
        fieldMappings.push({ id: `loaded-${i}`, ...m });
      });
      if (!arrayEntry?.value) {
        parsed.arrayMappings.forEach((am, i) => {
          arrayMappings.push({
            id: `arr-loaded-${i}`,
            ...am,
            mappings: am.mappings.map((m, j) => ({ id: `arr-loaded-${i}-${j}`, ...m })),
          });
        });
      }
    } catch {}
  }

  if (arrayEntry?.value) {
    try {
      const parsed = JSON.parse(arrayEntry.value);
      if (Array.isArray(parsed)) {
        parsed.forEach((am: any, i: number) => {
          arrayMappings.push({
            id: `arr-loaded-${i}`,
            source: am.source ?? '',
            target: am.target ?? '',
            alias: am.alias ?? 'item',
            filter: am.filter,
            mappings: (am.mappings ?? []).map((m: any, j: number) => ({
              id: `arr-loaded-${i}-${j}`,
              source: m.source ?? '',
              target: m.target ?? '',
              transform: m.transform,
              fixedValue: m.fixedValue,
              valuesSetId: m.valuesSetId ?? undefined,
            })),
          });
        });
      }
    } catch {}
  }

  return { fieldMappings, arrayMappings };
}

// ─── Initial state ────────────────────────────────────────────────────────────

export const initialMappingEditorState: MappingEditorState = {
  inputJson: '',
  outputJson: '',
  fieldMappings: [],
  arrayMappings: [],
  mode: 'visual',
  manualTemplate: '',
  isManualDirty: false,
  selectedMappingId: null,
  hoveredPath: null,
  searchInput: '',
  searchOutput: '',
  collapsedNodes: [],
  editingArrayId: null,
  newArrayPresetTarget: '',
  past: [],
  future: [],
  validationErrors: [],
  showValidation: false,
  showPreview: false,
  subscriptionId: null,
  mapperId: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function mappingEditorReducer(
  state: MappingEditorState,
  action: MappingEditorAction
): MappingEditorState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'LOAD_CONTEXT': {
        const { subscriptionId, mapperId, mapperProperties } = action.payload;
        draft.subscriptionId = subscriptionId;
        draft.mapperId = mapperId ?? null;
        // Always reset core state so a subscription with no mapper doesn't show stale data
        draft.fieldMappings = [];
        draft.arrayMappings = [];
        draft.inputJson = '';
        draft.outputJson = '';
        if (mapperProperties && mapperProperties.length > 0) {
          const core = loadFromProps(mapperProperties);
          draft.fieldMappings = core.fieldMappings;
          draft.arrayMappings = core.arrayMappings;
          const sjEntry = mapperProperties.find((p) => p.key === 'SourceJson');
          const tjEntry = mapperProperties.find((p) => p.key === 'TargetJson');
          if (sjEntry?.value) draft.inputJson = sjEntry.value;
          if (tjEntry?.value) draft.outputJson = tjEntry.value;
        }
        draft.past = [];
        draft.future = [];
        draft.selectedMappingId = null;
        draft.mode = 'visual';
        draft.isManualDirty = false;
        break;
      }
      case 'SET_INPUT_JSON':
        draft.inputJson = action.payload;
        break;
      case 'SET_OUTPUT_JSON':
        draft.outputJson = action.payload;
        break;
      case 'SET_MODE':
        draft.mode = action.payload;
        break;
      case 'SET_MANUAL_TEMPLATE':
        draft.manualTemplate = action.payload;
        draft.isManualDirty = true;
        break;
      case 'SYNC_MANUAL_TEMPLATE':
        draft.manualTemplate = action.payload;
        draft.isManualDirty = false;
        break;
      case 'CLEAR_MANUAL_DIRTY':
        draft.isManualDirty = false;
        break;
      case 'ADD_FIELD_MAPPING':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.fieldMappings.push({ id: genId(), ...action.payload });
        break;
      case 'REMOVE_FIELD_MAPPING':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.fieldMappings = draft.fieldMappings.filter((m) => m.id !== action.payload);
        if (draft.selectedMappingId === action.payload) draft.selectedMappingId = null;
        break;
      case 'UPDATE_FIELD_MAPPING': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const idx = draft.fieldMappings.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) draft.fieldMappings[idx] = { ...draft.fieldMappings[idx], ...action.payload };
        break;
      }
      case 'SET_FIELD_MAPPINGS':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.fieldMappings = action.payload;
        break;
      case 'SET_ARRAY_MAPPINGS':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.arrayMappings = action.payload;
        break;
      case 'ADD_ARRAY_MAPPING':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.arrayMappings.push({ id: genId(), ...action.payload });
        break;
      case 'REMOVE_ARRAY_MAPPING':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.arrayMappings = draft.arrayMappings.filter((m) => m.id !== action.payload);
        break;
      case 'UPDATE_ARRAY_MAPPING': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const idx = draft.arrayMappings.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) draft.arrayMappings[idx] = { ...draft.arrayMappings[idx], ...action.payload };
        break;
      }
      case 'ADD_ARRAY_FIELD_MAPPING': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const am = draft.arrayMappings.find((m) => m.id === action.payload.arrayId);
        if (am) am.mappings.push({ id: genId(), ...action.payload.mapping });
        break;
      }
      case 'REMOVE_ARRAY_FIELD_MAPPING': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const am = draft.arrayMappings.find((m) => m.id === action.payload.arrayId);
        if (am) am.mappings = am.mappings.filter((m) => m.id !== action.payload.mappingId);
        break;
      }
      case 'UPDATE_ARRAY_FIELD_MAPPING': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const am = draft.arrayMappings.find((m) => m.id === action.payload.arrayId);
        if (am) {
          const idx = am.mappings.findIndex((m) => m.id === action.payload.mapping.id);
          if (idx !== -1) am.mappings[idx] = { ...am.mappings[idx], ...action.payload.mapping };
        }
        break;
      }
      case 'SELECT_MAPPING':
        draft.selectedMappingId = action.payload;
        break;
      case 'SET_HOVERED_PATH':
        draft.hoveredPath = action.payload;
        break;
      case 'SET_SEARCH_INPUT':
        draft.searchInput = action.payload;
        break;
      case 'SET_SEARCH_OUTPUT':
        draft.searchOutput = action.payload;
        break;
      case 'TOGGLE_NODE_COLLAPSED': {
        const idx = draft.collapsedNodes.indexOf(action.payload);
        if (idx === -1) draft.collapsedNodes.push(action.payload);
        else draft.collapsedNodes.splice(idx, 1);
        break;
      }
      case 'OPEN_ARRAY_MODAL':
        draft.editingArrayId = action.payload.id;
        draft.newArrayPresetTarget = action.payload.presetTarget ?? '';
        break;
      case 'TOGGLE_PREVIEW':
        draft.showPreview = !draft.showPreview;
        break;
      case 'SET_VALIDATION_ERRORS':
        draft.validationErrors = action.payload;
        draft.showValidation = action.payload.length > 0;
        break;
      case 'TOGGLE_VALIDATION':
        draft.showValidation = !draft.showValidation;
        break;
      case 'UNDO': {
        if (state.past.length === 0) break;
        const prev = state.past[state.past.length - 1];
        draft.future = [snapshot(state), ...state.future.slice(0, 49)];
        draft.past = state.past.slice(0, -1);
        draft.fieldMappings = prev.fieldMappings;
        draft.arrayMappings = prev.arrayMappings;
        break;
      }
      case 'REDO': {
        if (state.future.length === 0) break;
        const next = state.future[0];
        draft.past = [...state.past.slice(-49), snapshot(state)];
        draft.future = state.future.slice(1);
        draft.fieldMappings = next.fieldMappings;
        draft.arrayMappings = next.arrayMappings;
        break;
      }
      case 'CLEAR_ALL':
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        draft.fieldMappings = [];
        draft.arrayMappings = [];
        break;
      case 'AUTO_MATCH': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        const norm = (s: string) =>
          (s.split('.').pop() ?? s).toLowerCase().replace(/[_\-\[\]\*]/g, '');
        let inputPaths: string[] = [];
        let outputPaths: string[] = [];
        try { inputPaths = flatPathsFromObj(JSON.parse(state.inputJson)); } catch {}
        try { outputPaths = flatPathsFromObj(JSON.parse(state.outputJson)); } catch {}

        const arrayTargets = new Set(state.arrayMappings.map((am) => am.target));
        const targetsToProcess = outputPaths.length > 0
          ? outputPaths.filter((p) => {
              if (p.includes('[*]')) return false;
              const parts = p.split('.');
              return !parts.some((_, i) => arrayTargets.has(parts.slice(0, i + 1).join('.')));
            })
          : state.fieldMappings.map((m) => m.target);

        const existingByTarget = new Map(state.fieldMappings.map((m) => [m.target, m]));
        const result: FieldMapping[] = [];

        for (const target of targetsToProcess) {
          const existing = existingByTarget.get(target);
          if (existing?.source || existing?.fixedValue !== undefined || existing?.valuesSetId) {
            result.push(existing);
            continue;
          }
          const match = inputPaths.find((p) => norm(p) === norm(target));
          if (existing) {
            result.push(
              match
                ? {
                    ...existing,
                    source: match,
                    fixedValue: undefined,
                    valuesSetId: undefined,
                    transform: undefined,
                  }
                : existing
            );
          } else if (match) {
            result.push({ id: genId(), source: match, target });
          }
        }

        for (const m of state.fieldMappings) {
          if (!result.find((r) => r.target === m.target)) result.push(m);
        }

        draft.fieldMappings = result;
        break;
      }
      case 'GENERATE_FROM_TARGET_JSON': {
        draft.past = [...draft.past.slice(-49), snapshot(state)];
        draft.future = [];
        try {
          const target = JSON.parse(state.outputJson);
          const paths = flatPathsFromObj(target);
          draft.fieldMappings = paths.map((p, i) => ({
            id: `gen-${i}-${Date.now()}`,
            target: p,
            source: '',
            isNullValue: true,
          }));
        } catch {}
        break;
      }
    }
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MappingEditorStateContext = createContext<MappingEditorState | null>(null);
const MappingEditorDispatchContext = createContext<React.Dispatch<MappingEditorAction> | null>(null);

export const MappingEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mappingEditorReducer, initialMappingEditorState);
  return (
    <MappingEditorStateContext.Provider value={state}>
      <MappingEditorDispatchContext.Provider value={dispatch}>
        {children}
      </MappingEditorDispatchContext.Provider>
    </MappingEditorStateContext.Provider>
  );
};

export function useMappingEditorState(): MappingEditorState {
  const ctx = useContext(MappingEditorStateContext);
  if (!ctx) throw new Error('useMappingEditorState must be used inside MappingEditorProvider');
  return ctx;
}

export function useMappingEditorDispatch(): React.Dispatch<MappingEditorAction> {
  const ctx = useContext(MappingEditorDispatchContext);
  if (!ctx) throw new Error('useMappingEditorDispatch must be used inside MappingEditorProvider');
  return ctx;
}
