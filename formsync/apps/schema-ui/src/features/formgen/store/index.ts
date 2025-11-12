import { create } from 'zustand';
import { FormModel, FieldModel } from '@formsync/formgen-core';
// import { produce } from 'immer';

interface EditorState {
    schemas: any[];
    isLoading: boolean;
    currentForm: FormModel | null;
    selectedFieldId: string | null;

    // Actions
    setSchemas: (schemas: any[]) => void;
    setLoading: (loading: boolean) => void;
    setForm: (form: FormModel) => void;
    selectField: (id: string | null) => void;

    // Form Mutations
    updateField: (id: string, updates: Partial<FieldModel>) => void;
    updateForm: (updates: Partial<FormModel>) => void;
    updateTheme: (updates: Partial<FormModel['theme']>) => void;
    reorderFields: (newOrder: string[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    schemas: [],
    isLoading: false,
    currentForm: null,
    selectedFieldId: null,

    setSchemas: (schemas) => set({ schemas }),
    setLoading: (isLoading) => set({ isLoading }),
    setForm: (currentForm) => set({ currentForm, selectedFieldId: null }),
    selectField: (selectedFieldId) => set({ selectedFieldId }),

    updateField: (id, updates) => set((state) => {
        if (!state.currentForm) return state;
        const fields = state.currentForm.fields.map(f =>
            f.id === id ? { ...f, ...updates, ui: { ...f.ui, ...updates.ui } } : f
        );
        return { currentForm: { ...state.currentForm, fields } };
    }),

    updateForm: (updates) => set((state) => {
        if (!state.currentForm) return state;
        return {
            currentForm: {
                ...state.currentForm,
                ...updates,
                // Handle nested updates if passed directly (e.g. ui)
                ui: (updates as any).ui ? { ...state.currentForm.ui, ...(updates as any).ui } : state.currentForm.ui
            }
        };
    }),

    updateTheme: (updates) => set((state) => {
        if (!state.currentForm) return state;
        return { currentForm: { ...state.currentForm, theme: { ...state.currentForm.theme, ...updates } } };
    }),

    reorderFields: (newOrder) => set((state) => {
        if (!state.currentForm) return state;
        // We update the layout.order
        // But we also need to conceptually reorder fields array if we rely on that?
        // FormModel has layout.order.
        return {
            currentForm: {
                ...state.currentForm,
                layout: { ...state.currentForm.layout, order: newOrder }
            }
        };
    }),
}));
