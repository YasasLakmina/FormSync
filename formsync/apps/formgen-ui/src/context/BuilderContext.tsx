import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { FormModel } from '@formsync/formgen-core';

// --- State Definition ---
interface BuilderState {
    form: FormModel;
    selectedFieldId: string | null;
}

// --- Action Definitions ---
type BuilderAction =
    | { type: 'SELECT_FIELD'; payload: string | null }
    | { type: 'UPDATE_FORM'; payload: FormModel }
    | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FormModel['fields'][0]> } }
    | { type: 'UPDATE_THEME'; payload: Partial<FormModel['theme']> };

// --- Initial State ---
// Minimal default state to avoid crashes before data is loaded
const initialState: BuilderState = {
    form: {
        id: 'default',
        name: 'Loading...',
        version: '1.0.0',
        theme: { primaryColor: '#000', fontFamily: 'sans-serif', radius: 4 },
        layout: { order: [] },
        fields: [],
    },
    selectedFieldId: null,
};

// --- Reducer ---
function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
    switch (action.type) {
        case 'SELECT_FIELD':
            return { ...state, selectedFieldId: action.payload };
        case 'UPDATE_FORM':
            return { ...state, form: action.payload };
        case 'UPDATE_FIELD':
            return {
                ...state,
                form: {
                    ...state.form,
                    fields: state.form.fields.map((field) =>
                        field.id === action.payload.fieldId
                            ? { ...field, ...action.payload.updates }
                            : field
                    ),
                },
            };
        case 'UPDATE_THEME':
            return {
                ...state,
                form: {
                    ...state.form,
                    theme: { ...state.form.theme, ...action.payload },
                },
            };
        default:
            return state;
    }
}

// --- Context Setup ---
const BuilderContext = createContext<{
    state: BuilderState;
    dispatch: Dispatch<BuilderAction>;
}>({ state: initialState, dispatch: () => null });

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(builderReducer, initialState);

    return (
        <BuilderContext.Provider value={{ state, dispatch }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => useContext(BuilderContext);
