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
  | 'unknown';

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

export interface FieldUIConfig {
  placeholder?: string;
  helpText?: string;
  hidden?: boolean;
  disabled?: boolean;
  style?: Record<string, string | number>;
  styleOverrides?: FieldStyleOverrides;
  [key: string]: string | number | boolean | Record<string, unknown> | FieldStyleOverrides | undefined;
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

export interface LayoutConfig {
  order: string[];
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
