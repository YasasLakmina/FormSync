/**
 * Schema Store (Zustand)
 *
 * Global state management for schemas, conversion, validation, and AI enhancement
 */

import { create } from 'zustand';
import { schemaApi } from '../api/schemaApi';

interface Schema {
  id: string;
  name: string;
  description?: string;
  content: any;
  sourceFormat: string;
  tags: string[];
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ValidationIssue {
  id: string;
  path: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface SchemaEnhancement {
  path: string;
  originalValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  reason: string;
}

interface SchemaSuggestion {
  id: string;
  path: string;
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>;
  description: string;
  applied: boolean;
  impactedDimensions?: string[];
  estimatedImpact?: number;
}

interface SchemaStore {
  // State
  schemas: Schema[];
  currentSchema: any;
  convertedSchema: any;
  enhancedSchema: any;
  baseSchema: any; // NEW: Enhanced schema before suggestions
  validationResults: any;
  enhancements: SchemaEnhancement[];
  suggestions: SchemaSuggestion[]; // NEW: AI suggestions
  aiChanges: any[]; // NEW: Auto-applied changes
  qualityMetrics: {
    qualityScore: number;
    qualityBreakdown: {
      structure: number;
      validation: number;
      accessibility: number;
      consistency: number;
      improvement: number;
    };
    issues: string[];
    explanations: Array<{
      path: string;
      action: string;
      reason: string;
    }>;
    metrics: {
      totalChanges: number;
      accessibilityCoverage: number;
    };
    appliedSuggestionsCount?: number;
    totalSuggestionsCount?: number;
  } | null;
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentSchema: (schema: any) => void;
  convertSchema: (input: string, format?: 'json' | 'yaml' | 'xml') => Promise<void>;
  enhanceSchema: (schema: any, options?: any) => Promise<void>;
  applySuggestion: (
    suggestion: SchemaSuggestion,
    action: 'apply' | 'undo'
  ) => Promise<number | undefined>;
  recalculateQuality: () => Promise<void>;
  validateSchema: (schema: any, validators?: string[]) => Promise<void>;
  loadSchemas: (userId?: string) => Promise<void>;
  loadSchema: (id: string) => Promise<void>;
  createSchema: (data: any) => Promise<void>;
  updateSchema: (id: string, data: any) => Promise<void>;
  deleteSchema: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSchemaStore = create<SchemaStore>((set, get) => ({
  // Initial state
  schemas: [],
  currentSchema: null,
  convertedSchema: null,
  enhancedSchema: null,
  baseSchema: null,
  validationResults: null,
  enhancements: [],
  suggestions: [],
  aiChanges: [],
  qualityMetrics: null,
  loading: false,
  error: null,

  // Actions
  setCurrentSchema: (schema) => set({ currentSchema: schema }),

  convertSchema: async (input, format) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.convert({ input, format });
      set({
        convertedSchema: response.data.schema,
        currentSchema: response.data.schema,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Conversion failed',
        loading: false,
      });
    }
  },

  enhanceSchema: async (schema, options) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.enhance({ schema, ...options });
      const data = response.data;

      set({
        enhancedSchema: data.enhancedSchema,
        baseSchema: data.enhancedSchema, // Store base schema (with auto-fixes, no suggestions)
        currentSchema: data.enhancedSchema, // Initialize current schema
        enhancements: data.changes || [],
        suggestions: data.suggestions || [], // Store AI suggestions
        aiChanges: data.changes || [], // Store auto-applied changes
        qualityMetrics: {
          qualityScore: data.quality?.score || data.qualityScore || 0,
          qualityBreakdown: data.quality?.breakdown ||
            data.qualityBreakdown || {
              structure: 0,
              validation: 0,
              accessibility: 0,
              consistency: 0,
              improvement: 0,
            },
          issues: data.quality?.issues || data.issues || [],
          explanations: data.explanations || [],
          metrics: data.metrics || { totalChanges: 0, accessibilityCoverage: 0 },
          appliedSuggestionsCount: 0, // No suggestions applied yet
          totalSuggestionsCount: (data.suggestions || []).length,
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'AI enhancement failed',
        loading: false,
      });
    }
  },

  applySuggestion: async (suggestion, action) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const response = await schemaApi.applySuggestion({
        baseSchema: state.baseSchema,
        suggestion,
        allSuggestions: state.suggestions,
        aiChanges: state.aiChanges,
        action,
      });

      const data = response.data;

      // Update the suggestion in the list
      const updatedSuggestions = state.suggestions.map((s) =>
        s.id === suggestion.id ? data.suggestion : s
      );

      set({
        currentSchema: data.schema, // Updated schema with suggestion applied/undone
        suggestions: updatedSuggestions,
        qualityMetrics: {
          qualityScore: data.quality?.score || data.qualityScore,
          qualityBreakdown: data.quality?.breakdown || data.qualityBreakdown,
          issues: data.quality?.issues || data.issues || [],
          explanations: state.qualityMetrics?.explanations || [],
          metrics: state.qualityMetrics?.metrics || { totalChanges: 0, accessibilityCoverage: 0 },
          appliedSuggestionsCount: updatedSuggestions.filter((s) => s.applied).length,
          totalSuggestionsCount: updatedSuggestions.length,
        },
        loading: false,
      });

      return data.scoreDelta;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to apply suggestion',
        loading: false,
      });
      throw error;
    }
  },

  recalculateQuality: async () => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const response = await schemaApi.recalculateQuality({
        baseSchema: state.baseSchema,
        allSuggestions: state.suggestions,
        aiChanges: state.aiChanges,
      });

      const data = response.data;

      set({
        qualityMetrics: {
          qualityScore: data.score,
          qualityBreakdown: data.breakdown,
          issues: data.issues || [],
          explanations: state.qualityMetrics?.explanations || [],
          metrics: state.qualityMetrics?.metrics || { totalChanges: 0, accessibilityCoverage: 0 },
          appliedSuggestionsCount: data.appliedSuggestionsCount,
          totalSuggestionsCount: data.totalSuggestionsCount,
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to recalculate quality',
        loading: false,
      });
    }
  },

  validateSchema: async (schema, validators) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.validate({ schema, validators });
      set({
        validationResults: response.data,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Validation failed',
        loading: false,
      });
    }
  },

  loadSchemas: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.list({ userId });
      set({ schemas: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load schemas',
        loading: false,
      });
    }
  },

  loadSchema: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.getById(id);
      set({
        currentSchema: response.data.content,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load schema',
        loading: false,
      });
    }
  },

  createSchema: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.create(data);
      set((state) => ({
        schemas: [response.data, ...state.schemas],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create schema',
        loading: false,
      });
    }
  },

  updateSchema: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await schemaApi.update(id, data);
      set((state) => ({
        schemas: state.schemas.map((s) => (s.id === id ? response.data : s)),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update schema',
        loading: false,
      });
    }
  },

  deleteSchema: async (id) => {
    set({ loading: true, error: null });
    try {
      await schemaApi.delete(id);
      set((state) => ({
        schemas: state.schemas.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete schema',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
