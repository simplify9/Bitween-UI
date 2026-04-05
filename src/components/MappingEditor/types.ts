// ─── Shared types for the MappingEditor (no Redux dependency) ─────────────────

export type FilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number;
}

export interface FieldMapping {
  id: string;
  source: string;
  target: string;
  transform?: string;
  fixedValue?: string;
  valuesSetId?: string;
  isNullValue?: boolean;
}

export interface ArrayMapping {
  id: string;
  source: string;
  target: string;
  alias: string;
  filter?: FilterCondition;
  mappings: FieldMapping[];
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
