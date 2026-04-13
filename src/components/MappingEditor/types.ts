// ─── Shared types for the MappingEditor (no Redux dependency) ─────────────────

export type FilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number;
}

export interface LookupEntry {
  from: string;
  to: string;
}

export interface LookupDictionary {
  entries: LookupEntry[];
  /** What to output when the source value isn't in the dictionary.
   *  passthrough = keep original value | null = output null | custom = use fallbackValue */
  fallback: 'passthrough' | 'null' | 'custom';
  fallbackValue?: string;
}

export interface FieldMapping {
  id: string;
  source: string;
  target: string;
  transform?: string;
  fixedValue?: string;
  /** Legacy global values-set reference — still rendered for backward compat. */
  valuesSetId?: string;
  /** Inline dictionary lookup — takes precedence over valuesSetId. */
  lookupDictionary?: LookupDictionary;
  /** True when source points to a root-level field (not an item field of the loop array). */
  isRootSource?: boolean;
}

export interface ArrayMapping {
  id: string;
  source: string;
  target: string;
  alias: string;
  filter?: FilterCondition;
  mappings: FieldMapping[];
  fixedItems?: Record<string, unknown>[];
  /** ID of the parent ArrayMapping. undefined/null means top-level. */
  parentArrayId?: string;
}

export type ValidationError = {
  type: 'error' | 'warning';
  message: string;
  path?: string;
};

export type EditorMode = 'visual' | 'canvas' | 'manual';

export const NATIVE_JSON_MAPPER_ID = 'NativeJSONMapper';

let _id = 0;
export const genId = () => `m-${++_id}-${Date.now()}`;
