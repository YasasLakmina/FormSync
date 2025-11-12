export interface ThemeTokens {
    colors: {
        primary: string;
        background: string;
        text: string;
        error: string;
        border: string;
    };
    spacing: {
        base: string; // e.g., '1rem'
        gap: string;
    };
    borderRadius: {
        base: string; // e.g., '0.5rem'
    };
    typography: {
        fontFamily: string;
        baseSize: string;
    };
}

export interface StyleOverrides {
    labelColor?: string;
    inputBackgroundColor?: string;
    borderColor?: string;
    focusColor?: string;
    textColor?: string;
    placeholderColor?: string;
}

export interface UiConfig {
    variant?: 'standard' | 'filled' | 'outlined'; // Global preference
    size?: 'sm' | 'md' | 'lg';
    layout?: 'vertical' | 'grid'; // Simplified
    submitLabel?: string;
}

export interface ValidationConstraint {
    type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url';
    value?: string | number | boolean;
    message?: string;
}

export interface FieldUiConfig {
    label?: string;
    placeholder?: string;
    helpText?: string;
    variant?: 'standard' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    hidden?: boolean;
    widget?: string; // Hint for specific widget, e.g., 'radio' vs 'select'
    options?: { label: string; value: string }[]; // For enum types
    style?: StyleOverrides;
}

export interface FieldModel {
    id: string; // Internal UUID
    key: string; // The data path/key in the result object
    type: string; // 'string', 'number', 'boolean', etc.
    constraints: ValidationConstraint[];
    ui: FieldUiConfig;
}

export interface LayoutModel {
    type: string; // 'vertical', 'grid'
    // Sections or groups can be added here
    order: string[]; // List of field IDs in order
}

export interface FormModel {
    id: string;
    title: string;
    description?: string;
    version: string;
    fields: FieldModel[];
    layout: LayoutModel;
    theme: ThemeTokens;
    ui: UiConfig;
}
