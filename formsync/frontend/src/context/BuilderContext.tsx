import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { FormModel, FieldModel, FieldType } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

interface BuilderState {
    form: FormModel;
    selectedFieldId: string | null;
    schemaId: string | null;
    /** Currently active wizard step (0-based). Ignored when layout.steps is undefined. */
    activeStep: number;
    /** Live preview values for condition evaluation in the canvas */
    previewValues: Record<string, unknown>;
    /** Undo/redo history */
    history: FormModel[];
    historyIndex: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type BuilderAction =
    | { type: 'SELECT_FIELD'; payload: string | null }
    | { type: 'UPDATE_FORM'; payload: FormModel }
    | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FieldModel> } }
    | { type: 'UPDATE_THEME'; payload: Partial<FormModel['theme']> }
    | { type: 'SET_SCHEMA_ID'; payload: string | null }
    // ── new actions ──────────────────────────────────────────────────────────
    | { type: 'ADD_FIELD'; payload: FieldModel }
    | { type: 'REMOVE_FIELD'; payload: string }
    | { type: 'REORDER_FIELDS'; payload: string[] }          // new layout.order
    | { type: 'SET_STEP'; payload: number }                  // wizard step
    | { type: 'SET_PREVIEW_VALUE'; payload: { key: string; value: unknown } }
    | { type: 'CLEAR_PREVIEW_VALUES' }
    | { type: 'UNDO' }
    | { type: 'REDO' };

// ─── Initial State ────────────────────────────────────────────────────────────

const BLANK_FORM: FormModel = {
    id: 'default',
    name: 'Loading...',
    version: '1.0.0',
    theme: {
        mode: 'light',
        density: 'normal',
        radius: 4,
        colors: {
            primary: '#3b82f6',
            background: '#ffffff',
            surface: '#ffffff',
            text: '#111827',
            muted: '#6b7280',
            border: '#e5e7eb',
            error: '#ef4444',
            inputBackground: '#ffffff',
        },
        typography: { fontFamily: 'Inter, sans-serif', baseFontSize: 16 },
    },
    layout: { order: [] },
    fields: [],
};

const initialState: BuilderState = {
    form: BLANK_FORM,
    selectedFieldId: null,
    schemaId: null,
    activeStep: 0,
    previewValues: {},
    history: [],
    historyIndex: -1,
};

// ─── History Helpers ──────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function pushHistory(state: BuilderState, nextForm: FormModel): BuilderState {
    const sliced = state.history.slice(0, state.historyIndex + 1);
    const newHistory = [...sliced, state.form].slice(-MAX_HISTORY);
    return {
        ...state,
        form: nextForm,
        history: newHistory,
        historyIndex: newHistory.length - 1,
    };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
    switch (action.type) {
        case 'SELECT_FIELD':
            return { ...state, selectedFieldId: action.payload };

        case 'UPDATE_FORM':
            return pushHistory(state, action.payload);

        case 'UPDATE_FIELD': {
            const { fieldId, updates } = action.payload;
            const nextForm: FormModel = {
                ...state.form,
                fields: state.form.fields.map((field) => {
                    if (field.id !== fieldId) return field;
                    // Deep-merge the `ui` sub-object so partial ui updates
                    // (e.g. just changing placeholder) don't wipe x-ui, x-conditions, etc.
                    const mergedUi = updates.ui !== undefined
                        ? { ...field.ui, ...updates.ui }
                        : field.ui;
                    return { ...field, ...updates, ui: mergedUi };
                }),
            };
            return pushHistory(state, nextForm);
        }

        case 'UPDATE_THEME': {
            const nextForm: FormModel = {
                ...state.form,
                theme: { ...state.form.theme, ...action.payload },
            };
            return pushHistory(state, nextForm);
        }

        case 'SET_SCHEMA_ID':
            return { ...state, schemaId: action.payload };

        // ── Field management ──────────────────────────────────────────────────

        case 'ADD_FIELD': {
            const field = action.payload;
            const nextForm: FormModel = {
                ...state.form,
                fields: [...state.form.fields, field],
                layout: {
                    ...state.form.layout,
                    order: [...state.form.layout.order, field.id],
                },
            };
            return pushHistory({ ...state, selectedFieldId: field.id }, nextForm);
        }

        case 'REMOVE_FIELD': {
            const id = action.payload;
            const nextForm: FormModel = {
                ...state.form,
                fields: state.form.fields.filter((f) => f.id !== id),
                layout: {
                    ...state.form.layout,
                    order: state.form.layout.order.filter((o) => o !== id),
                },
            };
            return pushHistory(
                { ...state, selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId },
                nextForm,
            );
        }

        case 'REORDER_FIELDS': {
            const nextForm: FormModel = {
                ...state.form,
                layout: { ...state.form.layout, order: action.payload },
            };
            return pushHistory(state, nextForm);
        }

        // ── Wizard step ─────────────────────────────────────────────────────

        case 'SET_STEP':
            return { ...state, activeStep: action.payload };

        // ── Preview values (for condition evaluation) ─────────────────────

        case 'SET_PREVIEW_VALUE':
            return {
                ...state,
                previewValues: {
                    ...state.previewValues,
                    [action.payload.key]: action.payload.value,
                },
            };

        case 'CLEAR_PREVIEW_VALUES':
            return { ...state, previewValues: {} };

        // ── Undo / Redo ──────────────────────────────────────────────────────

        case 'UNDO': {
            if (state.historyIndex < 0 || state.history.length === 0) return state;
            const prevIndex = state.historyIndex;
            const prevForm = state.history[prevIndex];
            if (!prevForm) return state;
            return {
                ...state,
                form: prevForm,
                history: [...state.history.slice(0, prevIndex), state.form],
                historyIndex: prevIndex - 1,
            };
        }

        case 'REDO': {
            // Classic redo is complex with push-on-change; for simplicity we keep undo only
            // Redo support can be added as a follow-up with a separate redoStack
            return state;
        }

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface BuilderContextValue {
    state: BuilderState;
    dispatch: Dispatch<BuilderAction>;
    /** Convenience: true if there is a past state to undo to */
    canUndo: boolean;
    /** True when the form is in wizard mode */
    isWizardMode: boolean;
    /** Total wizard steps count */
    stepCount: number;
}

const BuilderContext = createContext<BuilderContextValue>({
    state: initialState,
    dispatch: () => null,
    canUndo: false,
    isWizardMode: false,
    stepCount: 0,
});

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);

    const canUndo = state.historyIndex >= 0;
    const isWizardMode = !!state.form.layout.steps && state.form.layout.steps.length > 0;
    const stepCount = state.form.layout.steps?.length ?? 0;

    return (
        <BuilderContext.Provider value={{ state, dispatch, canUndo, isWizardMode, stepCount }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => useContext(BuilderContext);

// ─── Field Factory ────────────────────────────────────────────────────────────

/** Creates a new FieldModel with sensible defaults for a given type */
export function createField(type: FieldType, stepIndex?: number): FieldModel {
    const id = `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const base: FieldModel = {
        id,
        key: id,
        type,
        label: labelForType(type),
        required: false,
        ui: {},
        ...(stepIndex !== undefined ? { stepIndex } : {}),
    };

    switch (type) {
        case 'select':
            return { ...base, constraints: { enum: ['Option 1', 'Option 2'] } };
        case 'number':
            return { ...base, constraints: { min: 0 } };
        case 'file':
            return { ...base, ui: { 'x-ui': { accept: 'image/*,.pdf', multiple: false } } };
        case 'typeahead':
            return { ...base, ui: { 'x-ui': { asyncSource: { url: '', debounceMs: 300 } } } };
        case 'calculated':
            return { ...base, 'x-calc': '' };
        case 'repeater':
            return { ...base, children: [] };
        default:
            return base;
    }
}

function labelForType(type: FieldType): string {
    const labels: Partial<Record<FieldType, string>> = {
        text: 'Text Field',
        email: 'Email Field',
        password: 'Password Field',
        number: 'Number Field',
        select: 'Dropdown',
        checkbox: 'Checkbox',
        textarea: 'Text Area',
        date: 'Date Picker',
        group: 'Field Group',
        file: 'File Upload',
        richtext: 'Rich Text Editor',
        signature: 'Signature Pad',
        repeater: 'Repeater Section',
        typeahead: 'Typeahead Search',
        calculated: 'Calculated Field',
    };
    return labels[type] ?? 'Field';
}
