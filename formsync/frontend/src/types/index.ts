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
