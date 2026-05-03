/**
 * Canonical FormModel types shared by frontend, formgen-service, and static-frontend-generator.
 */

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "checkbox"
  | "textarea"
  | "date"
  | "group"
  | "file"
  | "richtext"
  | "signature"
  | "repeater"
  | "typeahead"
  | "calculated"
  | "unknown";

export type ConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "contains"
  | "in"
  | "notEmpty";

export interface ConditionRule {
  fieldKey: string;
  operator: ConditionOperator;
  value?: string | number | boolean | string[];
}

export interface FieldConditions {
  rules: ConditionRule[];
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

export interface AsyncSourceConfig {
  url: string;
  debounceMs?: number;
  labelPath?: string;
  valuePath?: string;
}

export interface FieldXUI {
  colSpan?: number;
  asyncSource?: AsyncSourceConfig;
  accept?: string;
  maxFileSizeBytes?: number;
  multiple?: boolean;
}

export interface FieldUIConfig {
  placeholder?: string;
  helpText?: string;
  hidden?: boolean;
  disabled?: boolean;
  style?: Record<string, string | number>;
  styleOverrides?: FieldStyleOverrides;
  "x-conditions"?: FieldConditions;
  "x-ui"?: FieldXUI;
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
  "x-calc"?: string;
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
  mode: "light" | "dark";
  density: "compact" | "normal" | "comfortable";
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

export interface FormStep {
  id: string;
  title: string;
  description?: string;
}

export interface LayoutConfig {
  order: string[];
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
