import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeyValuePair } from 'src/types/common';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number;
}

export interface FieldMapping {
  id: string;
  /** Dot-path in source JSON, e.g. "order.customer.name" or "item.price" (within array context) */
  source: string;
  /** Dot-path in target JSON, e.g. "buyer.fullName" */
  target: string;
  /** Optional expression string applied to source value, e.g. "value * 1.2" */
  transform?: string;
  /** When set, ignore source and use a fixed constant value */
  fixedValue?: string;
}

export interface ArrayMapping {
  id: string;
  /** Root path of source array, e.g. "order.items" */
  source: string;
  /** Root path of target array, e.g. "products" */
  target: string;
  /** Loop variable alias, default "item" */
  alias: string;
  /** Optional filter applied before mapping each item */
  filter?: FilterCondition;
  /** Field-level mappings within the loop context */
  mappings: FieldMapping[];
}

export type ValidationError = {
  type: 'error' | 'warning';
  message: string;
  path?: string;
};

type EditorMode = 'visual' | 'canvas' | 'manual';

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
  // UI
  selectedMappingId: string | null;
  hoveredPath: string | null;
  searchInput: string;
  searchOutput: string;
  collapsedNodes: string[];
  // Array mapping modal
  editingArrayId: string | null;
  newArrayPresetTarget: string;
  // Undo / redo snapshots
  past: CoreState[];
  future: CoreState[];
  // Validation
  validationErrors: ValidationError[];
  showValidation: boolean;
  // Preview
  showPreview: boolean;
  // Subscription context
  subscriptionId: number | null;
  mapperId: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
export const genId = () => `m-${++_id}-${Date.now()}`;

function snapshot(state: MappingEditorState): CoreState {
  return {
    fieldMappings: state.fieldMappings.map((m) => ({ ...m })),
    arrayMappings: state.arrayMappings.map((am) => ({
      ...am,
      mappings: am.mappings.map((m) => ({ ...m })),
    })),
  };
}

function pushHistory(state: MappingEditorState) {
  state.past = [...state.past.slice(-49), snapshot(state)];
  state.future = [];
}

export const NATIVE_JSON_MAPPER_ID = 'NativeJsonFieldMapper';

function loadFromProps(props: KeyValuePair[]): CoreState {
  const rulesEntry = props.find((p) => p.key === 'Rules');
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
            })),
          });
        });
      }
    } catch {}
  }

  return { fieldMappings, arrayMappings };
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: MappingEditorState = {
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

// ─── Slice ────────────────────────────────────────────────────────────────────

export const mappingEditorSlice = createSlice({
  name: 'mappingEditor',
  initialState,
  reducers: {
    // ── Context ──────────────────────────────────────────────────────────────
    loadEditorContext(
      state,
      action: PayloadAction<{
        subscriptionId: number;
        mapperId?: string | null;
        mapperProperties?: KeyValuePair[];
        sourceJson?: string;
        targetJson?: string;
      }>
    ) {
      const { subscriptionId, mapperId, mapperProperties, sourceJson, targetJson } = action.payload;
      state.subscriptionId = subscriptionId;
      state.mapperId = mapperId ?? null;
      if (mapperProperties) {
        const core = loadFromProps(mapperProperties);
        state.fieldMappings = core.fieldMappings;
        state.arrayMappings = core.arrayMappings;
        const sjEntry = mapperProperties.find((p) => p.key === 'SourceJson');
        const tjEntry = mapperProperties.find((p) => p.key === 'TargetJson');
        if (sjEntry?.value) state.inputJson = sjEntry.value;
        if (tjEntry?.value) state.outputJson = tjEntry.value;
      }
      if (sourceJson !== undefined) state.inputJson = sourceJson;
      if (targetJson !== undefined) state.outputJson = targetJson;
      state.past = [];
      state.future = [];
      state.selectedMappingId = null;
      state.mode = 'visual';
      state.isManualDirty = false;
    },

    // ── JSON inputs ───────────────────────────────────────────────────────────
    setInputJson(state, action: PayloadAction<string>) {
      state.inputJson = action.payload;
    },
    setOutputJson(state, action: PayloadAction<string>) {
      state.outputJson = action.payload;
    },

    // ── Mode ──────────────────────────────────────────────────────────────────
    setMode(state, action: PayloadAction<EditorMode>) {
      state.mode = action.payload;
    },
    setManualTemplate(state, action: PayloadAction<string>) {
      state.manualTemplate = action.payload;
      state.isManualDirty = true;
    },
    clearManualDirty(state) {
      state.isManualDirty = false;
    },

    // ── Field mappings ────────────────────────────────────────────────────────
    addFieldMapping(state, action: PayloadAction<Omit<FieldMapping, 'id'>>) {
      pushHistory(state);
      state.fieldMappings.push({ id: genId(), ...action.payload });
    },
    removeFieldMapping(state, action: PayloadAction<string>) {
      pushHistory(state);
      state.fieldMappings = state.fieldMappings.filter((m) => m.id !== action.payload);
      if (state.selectedMappingId === action.payload) state.selectedMappingId = null;
    },
    updateFieldMapping(state, action: PayloadAction<Partial<FieldMapping> & { id: string }>) {
      pushHistory(state);
      const idx = state.fieldMappings.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.fieldMappings[idx] = { ...state.fieldMappings[idx], ...action.payload };
    },
    setFieldMappings(state, action: PayloadAction<FieldMapping[]>) {
      pushHistory(state);
      state.fieldMappings = action.payload;
    },

    // ── Array mappings ────────────────────────────────────────────────────────
    addArrayMapping(state, action: PayloadAction<Omit<ArrayMapping, 'id'>>) {
      pushHistory(state);
      state.arrayMappings.push({ id: genId(), ...action.payload });
    },
    removeArrayMapping(state, action: PayloadAction<string>) {
      pushHistory(state);
      state.arrayMappings = state.arrayMappings.filter((m) => m.id !== action.payload);
    },
    updateArrayMapping(state, action: PayloadAction<Partial<ArrayMapping> & { id: string }>) {
      pushHistory(state);
      const idx = state.arrayMappings.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.arrayMappings[idx] = { ...state.arrayMappings[idx], ...action.payload };
    },
    addArrayFieldMapping(
      state,
      action: PayloadAction<{ arrayId: string; mapping: Omit<FieldMapping, 'id'> }>
    ) {
      pushHistory(state);
      const am = state.arrayMappings.find((m) => m.id === action.payload.arrayId);
      if (am) am.mappings.push({ id: genId(), ...action.payload.mapping });
    },
    removeArrayFieldMapping(
      state,
      action: PayloadAction<{ arrayId: string; mappingId: string }>
    ) {
      pushHistory(state);
      const am = state.arrayMappings.find((m) => m.id === action.payload.arrayId);
      if (am) am.mappings = am.mappings.filter((m) => m.id !== action.payload.mappingId);
    },
    updateArrayFieldMapping(
      state,
      action: PayloadAction<{ arrayId: string; mapping: Partial<FieldMapping> & { id: string } }>
    ) {
      pushHistory(state);
      const am = state.arrayMappings.find((m) => m.id === action.payload.arrayId);
      if (am) {
        const idx = am.mappings.findIndex((m) => m.id === action.payload.mapping.id);
        if (idx !== -1) am.mappings[idx] = { ...am.mappings[idx], ...action.payload.mapping };
      }
    },

    // ── UI state ─────────────────────────────────────────────────────────────
    selectMapping(state, action: PayloadAction<string | null>) {
      state.selectedMappingId = action.payload;
    },
    setHoveredPath(state, action: PayloadAction<string | null>) {
      state.hoveredPath = action.payload;
    },
    setSearchInput(state, action: PayloadAction<string>) {
      state.searchInput = action.payload;
    },
    setSearchOutput(state, action: PayloadAction<string>) {
      state.searchOutput = action.payload;
    },
    toggleNodeCollapsed(state, action: PayloadAction<string>) {
      const idx = state.collapsedNodes.indexOf(action.payload);
      if (idx === -1) {
        state.collapsedNodes.push(action.payload);
      } else {
        state.collapsedNodes.splice(idx, 1);
      }
    },
    openArrayModal(state, action: PayloadAction<{ id: string | null; presetTarget?: string }>) {
      state.editingArrayId = action.payload.id;
      state.newArrayPresetTarget = action.payload.presetTarget ?? '';
    },
    togglePreview(state) {
      state.showPreview = !state.showPreview;
    },
    setValidationErrors(state, action: PayloadAction<ValidationError[]>) {
      state.validationErrors = action.payload;
      state.showValidation = action.payload.length > 0;
    },
    toggleValidation(state) {
      state.showValidation = !state.showValidation;
    },

    // ── Undo / redo ───────────────────────────────────────────────────────────
    undo(state) {
      if (state.past.length === 0) return;
      const prev = state.past[state.past.length - 1];
      state.future = [snapshot(state), ...state.future.slice(0, 49)];
      state.past = state.past.slice(0, -1);
      state.fieldMappings = prev.fieldMappings;
      state.arrayMappings = prev.arrayMappings;
    },
    redo(state) {
      if (state.future.length === 0) return;
      const next = state.future[0];
      state.past = [...state.past.slice(-49), snapshot(state)];
      state.future = state.future.slice(1);
      state.fieldMappings = next.fieldMappings;
      state.arrayMappings = next.arrayMappings;
    },

    // ── Bulk operations ───────────────────────────────────────────────────────
    clearAll(state) {
      pushHistory(state);
      state.fieldMappings = [];
      state.arrayMappings = [];
    },
    autoMatch(state) {
      pushHistory(state);
      // Normalize name → strip dots/brackets/case
      const norm = (s: string) =>
        (s.split('.').pop() ?? s).toLowerCase().replace(/[_\-\[\]\*]/g, '');
      let inputPaths: string[] = [];
      try {
        const inp = JSON.parse(state.inputJson);
        inputPaths = flatPathsFromObj(inp);
      } catch {}
      state.fieldMappings = state.fieldMappings.map((m) => {
        if (m.source || m.fixedValue !== undefined) return m;
        const normTarget = norm(m.target);
        const match = inputPaths.find((p) => norm(p) === normTarget);
        return match ? { ...m, source: match } : m;
      });
    },
    generateFromTargetJson(state) {
      pushHistory(state);
      try {
        const target = JSON.parse(state.outputJson);
        const paths = flatPathsFromObj(target);
        let inputPaths: string[] = [];
        try {
          inputPaths = flatPathsFromObj(JSON.parse(state.inputJson));
        } catch {}
        const norm = (s: string) =>
          (s.split('.').pop() ?? s).toLowerCase().replace(/[_\-\[\]\*]/g, '');
        state.fieldMappings = paths.map((p, i) => ({
          id: `gen-${i}-${Date.now()}`,
          target: p,
          source: inputPaths.find((sp) => norm(sp) === norm(p)) ?? '',
        }));
      } catch {}
    },
  },
});

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

export const {
  loadEditorContext,
  setInputJson,
  setOutputJson,
  setMode,
  setManualTemplate,
  clearManualDirty,
  addFieldMapping,
  removeFieldMapping,
  updateFieldMapping,
  setFieldMappings,
  addArrayMapping,
  removeArrayMapping,
  updateArrayMapping,
  addArrayFieldMapping,
  removeArrayFieldMapping,
  updateArrayFieldMapping,
  selectMapping,
  setHoveredPath,
  setSearchInput,
  setSearchOutput,
  toggleNodeCollapsed,
  openArrayModal,
  togglePreview,
  setValidationErrors,
  toggleValidation,
  undo,
  redo,
  clearAll,
  autoMatch,
  generateFromTargetJson,
} = mappingEditorSlice.actions;

export default mappingEditorSlice.reducer;
