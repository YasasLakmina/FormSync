/**
 * Local type definitions for formgen-service.
 *
 * Inlined from packages/formgen-core so this service has zero shared-package coupling.
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
