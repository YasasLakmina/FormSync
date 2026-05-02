/**
 * Local type definitions for schema-ui.
 *
 * Inlined from packages/formgen-core so this app has zero shared-package coupling.
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'date'
  | 'group'
  // ── Advanced field types ──────────────────────────────────────────────────
  | 'file'        // File / image upload with accept + size constraints
  | 'richtext'    // WYSIWYG / rich-text editor
  | 'signature'   // Canvas-based signature pad
  | 'repeater'    // Dynamic array of child field groups
  | 'typeahead'   // Async-loaded select (fetches from an API URL)
  | 'calculated'  // Read-only derived value using an x-calc formula
  | 'unknown';

// ─── Condition Rule ──────────────────────────────────────────────────────────
// Used by x-conditions to show/hide a field based on other field values.

export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in' | 'notEmpty';

export interface ConditionRule {
  /** The key of the source field whose value is to be checked */
  fieldKey: string;
  operator: ConditionOperator;
  /** The value to compare against (not used for notEmpty) */
  value?: string | number | boolean | string[];
}

/** All rules must pass (AND logic). Use nested groups for OR via separate conditions. */
export interface FieldConditions {
  rules: ConditionRule[];
  /** Default visibility when conditions cannot be evaluated (e.g. preview mode) */
  defaultVisible?: boolean;
}

export interface FieldConstraints {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface FieldStyleOverrides {
  labelColor?: string;
  inputTextColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  focusColor?: string;
}

// ─── Advanced UI config extensions ─────────────────────────────────────────

/** Typeahead async source configuration */
export interface AsyncSourceConfig {
  /** The API URL to call. Use `{query}` as a placeholder for the search term. */
  url: string;
  /** Milliseconds to wait after keypress before fetching (default: 300) */
  debounceMs?: number;
  /** JSON path within the response array to use as the option label (default: 'label') */
  labelPath?: string;
  /** JSON path within the response array to use as the option value (default: 'value') */
  valuePath?: string;
}

/** Grid + advanced UI settings stored under x-ui namespace */
export interface FieldXUI {
  /** Column span in a 12-column grid (1–12, default: 12) */
  colSpan?: number;
  /** Config for typeahead / async dropdown fields */
  asyncSource?: AsyncSourceConfig;
  /** For file fields: comma-separated MIME types or extensions (e.g. 'image/*,.pdf') */
  accept?: string;
  /** For file fields: maximum file size in bytes */
  maxFileSizeBytes?: number;
  /** For file fields: allow multiple file selection */
  multiple?: boolean;
}

export interface FieldUIConfig {
  placeholder?: string;
  helpText?: string;
  hidden?: boolean;
  disabled?: boolean;
  style?: Record<string, string | number>;
  styleOverrides?: FieldStyleOverrides;
  /** x-conditions: conditional visibility rules for this field */
  'x-conditions'?: FieldConditions;
  /** x-ui: advanced grid and type-specific UI configuration */
  'x-ui'?: FieldXUI;
  [key: string]: unknown;
}

export interface FieldModel {
  id: string;
  key: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: string | number | boolean | null;
  constraints?: FieldConstraints;
  ui?: FieldUIConfig;
  children?: FieldModel[];
  /** x-calc: formula string for calculated fields (e.g. '{quantity} * {price}') */
  'x-calc'?: string;
  /** Step index this field belongs to (0-based). Undefined = not wizard-assigned */
  stepIndex?: number;
}

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  error: string;
  inputBackground: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  density: 'compact' | 'normal' | 'comfortable';
  colors: ThemeColors;
  schemes?: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  typography: {
    fontFamily: string;
    baseFontSize: number;
  };
  radius: number;
  primaryColor?: string;
}

/** A named step in a multi-step (wizard) form */
export interface FormStep {
  id: string;
  title: string;
  description?: string;
}

export interface LayoutConfig {
  order: string[];
  /** Optional wizard step definitions. When present, the form renders as a multi-step wizard. */
  steps?: FormStep[];
}

export interface SubmitConfig {
  text: string;
  color?: string;
}

export interface FormModel {
  id: string;
  name: string;
  version: string;
  meta?: {
    title?: string;
    description?: string;
  };
  theme: ThemeConfig;
  layout: LayoutConfig;
  fields: FieldModel[];
  submit?: SubmitConfig;
}

// ─── JSON Schema adapter ──────────────────────────────────────────────────────

export interface JsonSchema {
  $id?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: (string | number)[];
  default?: string | number | boolean | null;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  format?: string;
  items?: JsonSchema;
  [key: string]: unknown;
}

function humanizeLabel(key: string): string {
  return key
    .split('.')
    .map((part) =>
      part
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
    )
    .join(' ');
}

function mapPropertyToField(key: string, schema: JsonSchema, isRequired: boolean): FieldModel {
  const label = schema.title || humanizeLabel(key);
  let type: FieldType = 'unknown';

  if (schema.enum) {
    type = 'select';
  } else if (schema.type === 'boolean') {
    type = 'checkbox';
  } else if (schema.type === 'integer' || schema.type === 'number') {
    type = 'number';
  } else if (schema.type === 'string') {
    if (schema.format === 'date' || schema.format === 'date-time') type = 'date';
    else if (schema.format === 'email') type = 'email';
    else type = 'text';
  }

  const constraints: FieldConstraints = {};
  if (schema.minimum !== undefined) constraints.min = schema.minimum;
  if (schema.maximum !== undefined) constraints.max = schema.maximum;
  if (schema.minLength !== undefined) constraints.minLength = schema.minLength;
  if (schema.maxLength !== undefined) constraints.maxLength = schema.maxLength;
  if (schema.pattern !== undefined) constraints.pattern = schema.pattern;
  if (schema.enum !== undefined) constraints.enum = schema.enum.map(String);

  const field: FieldModel = {
    id: `field-${key.replace(/\./g, '-')}`,
    key,
    type,
    label,
    required: isRequired,
    constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
    ui: {},
  };

  if (
    schema.default !== undefined &&
    (typeof schema.default === 'string' ||
      typeof schema.default === 'number' ||
      typeof schema.default === 'boolean')
  ) {
    field.defaultValue = schema.default;
  }

  return field;
}

function extractFields(schema: JsonSchema, parentKey = ''): FieldModel[] {
  const fields: FieldModel[] = [];
  const properties = schema.properties || {};
  const currentRequiredList = schema.required || [];

  for (const [key, propSchema] of Object.entries(properties)) {
    if (!propSchema || typeof propSchema !== 'object') continue;

    const compositeKey = parentKey ? `${parentKey}.${key}` : key;
    const isRequired = currentRequiredList.includes(key);

    if (propSchema.type === 'object' && propSchema.properties) {
      fields.push({
        id: `field-${compositeKey.replace(/\./g, '-')}`,
        key: compositeKey,
        type: 'group',
        label: propSchema.title || humanizeLabel(key),
        required: isRequired,
        children: extractFields(propSchema, compositeKey),
        ui: {},
      });
    } else {
      fields.push(mapPropertyToField(compositeKey, propSchema, isRequired));
    }
  }

  return fields;
}

export function parseJsonSchemaToFormModel(schema: JsonSchema): FormModel {
  const fields = extractFields(schema);
  const layout: LayoutConfig = { order: fields.map((f) => f.id) };
  const theme: ThemeConfig = {
    mode: 'light',
    density: 'normal',
    radius: 4,
    colors: {
      primary: '#000000',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      inputBackground: '#ffffff',
    },
    typography: { fontFamily: 'Inter, sans-serif', baseFontSize: 16 },
  };

  return {
    id: schema.$id || 'form-' + Date.now().toString(36),
    name: schema.title || 'Untitled Form',
    version: '1.0.0',
    meta: { title: schema.title, description: schema.description },
    theme,
    layout,
    fields,
    submit: { text: 'Submit' },
  };
}

// ─── FormModel → JSON Schema ─────────────────────────────────────────────────

/** Top-level JSON Schema property name for a root field key (first segment only). */
function topLevelPropertyKey(field: FieldModel): string {
  if (!field.key.includes('.')) return field.key;
  return field.key.split('.')[0]!;
}

function leafFieldToJsonSchema(field: FieldModel): JsonSchema {
  const prop: JsonSchema = { title: field.label };

  if (field.ui?.helpText) {
    prop.description = field.ui.helpText;
  }

  switch (field.type) {
    case 'checkbox':
      prop.type = 'boolean';
      break;
    case 'number':
      prop.type = 'number';
      if (field.constraints?.min !== undefined) prop.minimum = field.constraints.min;
      if (field.constraints?.max !== undefined) prop.maximum = field.constraints.max;
      break;
    case 'select':
      prop.type = 'string';
      if (field.constraints?.enum?.length) {
        prop.enum = field.constraints.enum.map((e) => e as string | number);
      }
      break;
    case 'date':
      prop.type = 'string';
      prop.format = 'date';
      break;
    case 'email':
      prop.type = 'string';
      prop.format = 'email';
      break;
    case 'password':
      prop.type = 'string';
      prop.format = 'password';
      break;
    case 'textarea':
      prop.type = 'string';
      break;
    case 'file':
    case 'richtext':
    case 'signature':
    case 'typeahead':
    case 'calculated':
    case 'repeater':
    case 'unknown':
      prop.type = 'string';
      prop['x-field-type'] = field.type;
      break;
    default:
      prop.type = 'string';
  }

  if (field.constraints?.minLength !== undefined) prop.minLength = field.constraints.minLength;
  if (field.constraints?.maxLength !== undefined) prop.maxLength = field.constraints.maxLength;
  if (field.constraints?.pattern !== undefined) prop.pattern = field.constraints.pattern;

  if (
    field.defaultValue !== undefined &&
    (typeof field.defaultValue === 'string' ||
      typeof field.defaultValue === 'number' ||
      typeof field.defaultValue === 'boolean')
  ) {
    prop.default = field.defaultValue;
  }

  const ui = field.ui;
  if (ui?.['x-conditions']) prop['x-conditions'] = ui['x-conditions'];
  if (ui?.['x-ui']) prop['x-ui'] = ui['x-ui'];
  if (field['x-calc']) prop['x-calc'] = field['x-calc'];

  return prop;
}

function groupFieldToJsonSchema(field: FieldModel): JsonSchema {
  const parentKey = field.key;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const child of field.children ?? []) {
    const rel = child.key.startsWith(parentKey + '.')
      ? child.key.slice(parentKey.length + 1)
      : child.key;
    const propName = rel.includes('.') ? rel.split('.')[0]! : rel;

    if (properties[propName]) continue;

    if (child.type === 'group') {
      properties[propName] = groupFieldToJsonSchema(child);
    } else {
      properties[propName] = leafFieldToJsonSchema(child);
    }

    if (child.required) {
      required.push(propName);
    }
  }

  const schema: JsonSchema = {
    type: 'object',
    title: field.label,
    properties,
  };

  const uniq = [...new Set(required)];
  if (uniq.length > 0) {
    schema.required = uniq;
  }

  return schema;
}

/**
 * Serializes the builder FormModel to JSON Schema, optionally merging onto a loaded base
 * so extensions like `$schema` and `x-formsync-metadata` are preserved.
 */
export function formModelToJsonSchema(form: FormModel, base?: JsonSchema): JsonSchema {
  const merged: JsonSchema = base
    ? ({ ...base } as JsonSchema)
    : { $schema: 'http://json-schema.org/draft-07/schema#' };

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const byId = new Map(form.fields.map((f) => [f.id, f] as const));

  for (const fieldId of form.layout.order) {
    const field = byId.get(fieldId);
    if (!field) continue;

    const propKey = topLevelPropertyKey(field);
    if (properties[propKey]) continue;

    if (field.type === 'group') {
      properties[propKey] = groupFieldToJsonSchema(field);
    } else {
      properties[propKey] = leafFieldToJsonSchema(field);
    }

    if (field.required) {
      required.push(propKey);
    }
  }

  merged.type = 'object';
  merged.title = form.meta?.title ?? form.name;
  if (form.meta?.description !== undefined) {
    merged.description = form.meta.description;
  }
  merged.properties = properties;
  const uniqReq = [...new Set(required)];
  merged.required = uniqReq.length > 0 ? uniqReq : undefined;

  return merged;
}

export interface BuilderJsonSchemaValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Structural validation for builder-produced object schemas (root + nested groups).
 * Does not guarantee full JSON Schema draft compliance.
 */
export function validateBuilderJsonSchema(schema: unknown): BuilderJsonSchemaValidationResult {
  const errors: string[] = [];

  function checkObjectSchema(obj: Record<string, unknown>, path: string): void {
    if (obj.type !== undefined && obj.type !== 'object') {
      errors.push(`${path}: object schemas must have type "object"`);
    }

    const props = obj.properties;
    if (!props || typeof props !== 'object' || Array.isArray(props)) {
      errors.push(`${path}.properties must be an object`);
      return;
    }

    const req = obj.required;
    if (req !== undefined) {
      if (!Array.isArray(req)) {
        errors.push(`${path}.required must be an array`);
      } else {
        const keys = Object.keys(props as Record<string, unknown>);
        for (const entry of req) {
          if (typeof entry !== 'string') {
            errors.push(`${path}.required entries must be strings`);
          } else if (!keys.includes(entry)) {
            errors.push(`${path}.required references unknown property "${entry}"`);
          }
        }
      }
    }

    for (const [key, val] of Object.entries(props)) {
      if (!val || typeof val !== 'object' || Array.isArray(val)) {
        errors.push(`${path}.properties["${key}"] must be an object`);
        continue;
      }
      const sub = val as Record<string, unknown>;
      if (sub.type === 'object' && sub.properties) {
        checkObjectSchema(sub as Record<string, unknown>, `${path}.properties["${key}"]`);
      }
    }
  }

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    errors.push('$: schema must be an object');
    return { valid: false, errors };
  }

  checkObjectSchema(schema as Record<string, unknown>, '$');

  return { valid: errors.length === 0, errors };
}
