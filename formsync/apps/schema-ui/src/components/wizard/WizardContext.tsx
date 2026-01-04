/**
 * Wizard Context - State Management for Non-Technical User Flow
 * 
 * Manages the entire wizard state including:
 * - Current step and navigation
 * - Mode selection (template vs custom)
 * - Field configuration
 * - Schema generation
 * - Validation and AI integration
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== Types ====================

export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'textarea'
  | 'tel'
  | 'url'
  | 'password';

export interface FieldConfig {
  id: string;
  name: string;              // Display label
  type: FieldType;
  required: boolean;
  min?: number;              // For text/number
  max?: number;
  options?: string[];        // For select
  defaultValue?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
}

export interface ValidationResult {
  valid: boolean;
  syntaxErrors?: any[];
  message?: string;
}

export interface AISuggestion {
  id: string;
  type: string;
  path: string;
  value: any;
  applied: boolean;
  message?: string;
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  mode: 'template' | 'custom' | null;
  selectedTemplate: Template | null;
  fields: FieldConfig[];
  generatedSchema: any | null;
  validationResult: ValidationResult | null;
  aiSuggestions: AISuggestion[];
  appliedSuggestions: Set<string>;
  isLoading: boolean;
  error: string | null;
}

// ==================== Actions ====================

type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_MODE'; payload: 'template' | 'custom' }
  | { type: 'SELECT_TEMPLATE'; payload: Template }
  | { type: 'ADD_FIELD'; payload: FieldConfig }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<FieldConfig> } }
  | { type: 'REMOVE_FIELD'; payload: string }
  | { type: 'SET_FIELDS'; payload: FieldConfig[] }
  | { type: 'GENERATE_SCHEMA'; payload: any }
  | { type: 'SET_VALIDATION_RESULT'; payload: ValidationResult }
  | { type: 'SET_AI_SUGGESTIONS'; payload: AISuggestion[] }
  | { type: 'APPLY_AI_SUGGESTION'; payload: string }
  | { type: 'UNDO_AI_SUGGESTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_WIZARD' };

// ==================== Initial State ====================

const initialState: WizardState = {
  currentStep: 1,
  totalSteps: 7,
  mode: null,
  selectedTemplate: null,
  fields: [],
  generatedSchema: null,
  validationResult: null,
  aiSuggestions: [],
  appliedSuggestions: new Set(),
  isLoading: false,
  error: null
};

// ==================== Reducer ====================

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(1, Math.min(action.payload, state.totalSteps))
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        // Clear template if switching to custom
        selectedTemplate: action.payload === 'custom' ? null : state.selectedTemplate
      };

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        selectedTemplate: action.payload,
        fields: [...action.payload.fields],
        mode: 'template'
      };

    case 'ADD_FIELD':
      return {
        ...state,
        fields: [...state.fields, action.payload]
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(field =>
          field.id === action.payload.id
            ? { ...field, ...action.payload.updates }
            : field
        )
      };

    case 'REMOVE_FIELD':
      return {
        ...state,
        fields: state.fields.filter(field => field.id !== action.payload)
      };

    case 'SET_FIELDS':
      return {
        ...state,
        fields: action.payload
      };

    case 'GENERATE_SCHEMA':
      return {
        ...state,
        generatedSchema: action.payload
      };

    case 'SET_VALIDATION_RESULT':
      return {
        ...state,
        validationResult: action.payload
      };

    case 'SET_AI_SUGGESTIONS':
      return {
        ...state,
        aiSuggestions: action.payload
      };

    case 'APPLY_AI_SUGGESTION':
      const newApplied = new Set(state.appliedSuggestions);
      newApplied.add(action.payload);
      return {
        ...state,
        appliedSuggestions: newApplied,
        aiSuggestions: state.aiSuggestions.map(s =>
          s.id === action.payload ? { ...s, applied: true } : s
        )
      };

    case 'UNDO_AI_SUGGESTION':
      const updatedApplied = new Set(state.appliedSuggestions);
      updatedApplied.delete(action.payload);
      return {
        ...state,
        appliedSuggestions: updatedApplied,
        aiSuggestions: state.aiSuggestions.map(s =>
          s.id === action.payload ? { ...s, applied: false } : s
        )
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'RESET_WIZARD':
      return initialState;

    default:
      return state;
  }
}

// ==================== Context ====================

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

// ==================== Provider ====================

interface WizardProviderProps {
  children: ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

// ==================== Hook ====================

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}

// ==================== Helper Functions ====================

/**
 * Check if current step is valid and can proceed
 */
export function canProceedToNextStep(state: WizardState): boolean {
  switch (state.currentStep) {
    case 1: // Mode selection
      return state.mode !== null;
    
    case 2: // Template selection (only for template mode)
      if (state.mode === 'custom') return true;
      return state.selectedTemplate !== null;
    
    case 3: // Field builder
      return state.fields.length > 0;
    
    case 4: // Schema preview
      return state.generatedSchema !== null;
    
    case 5: // Validation
      return state.validationResult?.valid === true;
    
    case 6: // AI enhancement
      return true; // Always can proceed
    
    case 7: // Final output
      return false; // Last step
    
    default:
      return false;
  }
}

/**
 * Get step title
 */
export function getStepTitle(step: number): string {
  const titles = [
    '',
    'Choose Creation Mode',
    'Select Template',
    'Build Your Form',
    'Preview Schema',
    'Validation',
    'AI Enhancements',
    'Your Form is Ready!'
  ];
  return titles[step] || '';
}
