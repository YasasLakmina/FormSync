import React, { createContext, useContext, useReducer, Dispatch, useEffect } from 'react';
import { FormModel, FieldModel, FieldType, JsonSchema, formModelToJsonSchema } from '../types';

export const FORMSYNC_BUILDER_DRAFT_KEY = 'formsync_builder_draft';
export const FORMSYNC_BUILDER_SCHEMA_ID_KEY = 'formsync_builder_schema_id';
/**
 * One-shot sessionStorage payload after leaving the Form Builder for `/generated?schemaId=…`
 * (supports full-page navigation). Carries the canonical JSON Schema for all generators.
 */
export const FORMSYNC_BUILDER_EXPORT_FORM_KEY = 'formsync_builder_export_form';

export interface BuilderExportPayload {
  schemaId: string;
  form: FormModel;
  syncedSchema: JsonSchema;
}

export function clearBuilderDraft(): void {
    try {
        sessionStorage.removeItem(FORMSYNC_BUILDER_DRAFT_KEY);
    } catch {
        /* ignore */
    }
}

// ─── State ────────────────────────────────────────────────────────────────────

interface BuilderState {
    form: FormModel;
    /** Original JSON Schema when the form was loaded (merge base for serialization). */
    baseJsonSchema: JsonSchema | null;
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
    | { type: 'SET_BASE_SCHEMA'; payload: JsonSchema | null }
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
    baseJsonSchema: null,
    selectedFieldId: null,
    schemaId: null,
    activeStep: 0,
    previewValues: {},
    history: [],
    historyIndex: -1,
};

// ─── Tree Helpers ─────────────────────────────────────────────────────────────

/** Recursively find a field by id, including inside group children */
export function findFieldInTree(fields: FieldModel[], id: string): FieldModel | undefined {
    for (const field of fields) {
        if (field.id === id) return field;
        if (field.children) {
            const found = findFieldInTree(field.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

/** Recursively update a field by id, merging ui sub-object. Works on nested children. */
function updateFieldInTree(
    fields: FieldModel[],
    fieldId: string,
    updates: Partial<FieldModel>,
): FieldModel[] {
    return fields.map((field) => {
        if (field.id === fieldId) {
            const mergedUi = updates.ui !== undefined
                ? { ...field.ui, ...updates.ui }
                : field.ui;
            return { ...field, ...updates, ui: mergedUi };
        }
        if (field.children && field.children.length > 0) {
            return { ...field, children: updateFieldInTree(field.children, fieldId, updates) };
        }
        return field;
    });
}

/** Recursively remove a field by id, including from children arrays. */
function removeFieldFromTree(fields: FieldModel[], id: string): FieldModel[] {
    return fields
        .filter((f) => f.id !== id)
        .map((f) =>
            f.children ? { ...f, children: removeFieldFromTree(f.children, id) } : f,
        );
}


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
                fields: updateFieldInTree(state.form.fields, fieldId, updates),
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

        case 'SET_BASE_SCHEMA':
            return { ...state, baseJsonSchema: action.payload };

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
                fields: removeFieldFromTree(state.form.fields, id),
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

    useEffect(() => {
        if (state.schemaId) {
            try {
                sessionStorage.setItem(FORMSYNC_BUILDER_SCHEMA_ID_KEY, state.schemaId);
            } catch {
                /* ignore */
            }
        } else {
            try {
                sessionStorage.removeItem(FORMSYNC_BUILDER_SCHEMA_ID_KEY);
            } catch {
                /* ignore */
            }
        }
    }, [state.schemaId]);

    useEffect(() => {
        const isBlankInitial =
            state.form.id === 'default' &&
            state.form.name === 'Loading...' &&
            state.form.fields.length === 0;
        if (isBlankInitial) return;

        const t = window.setTimeout(() => {
            try {
                sessionStorage.setItem(
                    FORMSYNC_BUILDER_DRAFT_KEY,
                    JSON.stringify({
                        form: state.form,
                        activeStep: state.activeStep,
                        schemaId: state.schemaId,
                        updatedAt: Date.now(),
                    }),
                );
            } catch {
                /* quota or disabled storage */
            }
            try {
                const synced = formModelToJsonSchema(
                    state.form,
                    state.baseJsonSchema ?? undefined,
                );
                sessionStorage.setItem('formsync_schema_raw', JSON.stringify(synced));
            } catch {
                /* invalid or oversize form — skip */
            }
        }, 400);
        return () => window.clearTimeout(t);
    }, [state.form, state.activeStep, state.schemaId, state.baseJsonSchema]);

    return (
        <BuilderContext.Provider value={{ state, dispatch, canUndo, isWizardMode, stepCount }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => useContext(BuilderContext);

// ─── Field Factory ────────────────────────────────────────────────────────────

/** Collect every field key in the tree (for avoiding duplicate semantic keys). */
export function collectAllFieldKeys(fields: FieldModel[]): string[] {
    const keys: string[] = [];
    const walk = (fs: FieldModel[]) => {
        for (const f of fs) {
            keys.push(f.key);
            if (f.children?.length) walk(f.children);
        }
    };
    walk(fields);
    return keys;
}

/** "Date Picker" / "Text Field" → datePicker / text (camelCase, stable API names). */
function labelStemToCamelCase(label: string): string {
    const trimmed = label.replace(/\s+Field$/i, '').trim();
    const parts = trimmed.split(/[^a-zA-Z0-9]+/).filter(Boolean);
    if (parts.length === 0) return '';
    return (
        parts[0]!.toLowerCase() +
        parts.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')
    );
}

function uniqueSemanticFieldKey(
    baseLabel: string,
    type: FieldType,
    taken: Set<string>,
): string {
    let stem = labelStemToCamelCase(baseLabel);
    if (!stem) stem = type.replace(/[^a-zA-Z0-9]/g, '') || 'field';
    if (!/^[a-zA-Z_$]/.test(stem)) stem = `field_${stem}`;
    let candidate = stem;
    if (!taken.has(candidate)) return candidate;
    let n = 2;
    while (taken.has(`${stem}${n}`)) n += 1;
    return `${stem}${n}`;
}

/** Optional defaults when inserting from the palette (e.g. repeater shown as a data table). */
export type CreateFieldOptions = {
    repeaterAsTable?: boolean;
};

/** Creates a new FieldModel with sensible defaults for a given type */
export function createField(
    type: FieldType,
    stepIndex?: number,
    existingKeys?: Iterable<string>,
    options?: CreateFieldOptions,
): FieldModel {
    const taken = new Set(existingKeys ?? []);
    const id = `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const repeaterAsTable = type === 'repeater' && options?.repeaterAsTable === true;
    const baseLabel = repeaterAsTable ? 'Repeating table' : labelForType(type);
    const key = uniqueSemanticFieldKey(baseLabel, type, taken);
    const base: FieldModel = {
        id,
        key,
        type,
        label: baseLabel,
        required: false,
        ui: repeaterAsTable
            ? { displayMode: 'table' }
            : {
                  placeholder: `Enter ${baseLabel.toLowerCase()}...`,
              },
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
