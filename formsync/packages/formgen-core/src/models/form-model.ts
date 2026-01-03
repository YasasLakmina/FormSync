/**
 * Internal FormModel Definitions
 *
 * This represents the normalized data structure for the form generator.
 * It is designated as the Single Source of Truth for:
 * 1. Visual Preview (formgen-ui)
 * 2. Code Generation (formgen-api)
 *
 * CONSTRAINTS:
 * - Must be strictly JSON-serializable (no Date, Map, Set, Functions).
 * - Framework-agnostic (no React/NestJS specific types).
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
    | 'unknown';

export interface FieldConstraints {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: string[];
    [key: string]: string | number | boolean | string[] | undefined; // Extensible
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
    style?: Record<string, string | number>; // Minimal inline styles
    styleOverrides?: FieldStyleOverrides;
    [key: string]: string | number | boolean | Record<string, unknown> | FieldStyleOverrides | undefined;
}

export interface FieldModel {
    /** Stable UUID for references */
    id: string;
    /** Property key from original schema */
    key: string;
    type: FieldType;
    label: string;
    required: boolean;
    /** strictly serializable default value */
    defaultValue?: string | number | boolean | null;
    constraints?: FieldConstraints;
    ui?: FieldUIConfig;
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
    /** consistent radius unit */
    radius: number;
    // Legacy fallback compatibility optional
    primaryColor?: string;
}

export interface LayoutConfig {
    /** Ordered list of Field IDs to determine render sequence */
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
