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

interface SchemaStore {
  // State
  schemas: Schema[];
  currentSchema: any;
  convertedSchema: any;
  enhancedSchema: any;
  validationResults: any;
  enhancements: SchemaEnhancement[];
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentSchema: (schema: any) => void;
  convertSchema: (input: string, format?: 'json' | 'yaml' | 'xml') => Promise<void>;
  enhanceSchema: (schema: any, options?: any) => Promise<void>;
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
  validationResults: null,
  enhancements: [],
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
      set({
        enhancedSchema: response.data.enhancedSchema,
        enhancements: response.data.changes || [],
        // Note: We DON'T update currentSchema here - it stays as the converted schema
        // Only clicking individual suggestions will modify currentSchema
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'AI enhancement failed',
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
