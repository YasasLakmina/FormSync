/**
 * API Client
 *
 * Axios-based HTTP client for communicating with the NestJS backend
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for future auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== Schema API =====

export interface ConvertSchemaRequest {
  input: string;
  format?: 'json' | 'yaml' | 'xml';
}

export interface EnhanceSchemaRequest {
  schema: any;
  focusAreas?: ('naming' | 'validation' | 'accessibility' | 'descriptions')[];
  preserveStructure?: boolean;
  provider?: string;
}

export interface ValidateSchemaRequest {
  schema: any;
  validators?: string[];
}

export interface CreateSchemaRequest {
  name: string;
  description?: string;
  content: any;
  sourceFormat?: string;
  tags?: string[];
  userId: string;
  status?: 'draft' | 'validated' | 'enhanced' | 'published';
}

export interface UpdateSchemaRequest {
  name?: string;
  description?: string;
  content?: any;
  tags?: string[];
  status?: 'draft' | 'validated' | 'enhanced' | 'published';
  changeLog?: string;
}

// ===== Suggestion Management =====

export interface SchemaSuggestion {
  id: string;
  path: string;
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>;
  description: string;
  applied: boolean;
  impactedDimensions?: string[];
  estimatedImpact?: number;
}

export interface ApplySuggestionRequest {
  baseSchema: any;
  suggestion: SchemaSuggestion;
  allSuggestions: SchemaSuggestion[];
  aiChanges: any[];
  action: 'apply' | 'undo';
}

export interface RecalculateQualityRequest {
  baseSchema: any;
  allSuggestions: SchemaSuggestion[];
  aiChanges: any[];
}

export const schemaApi = {
  // Convert schema
  convert: (data: ConvertSchemaRequest) => apiClient.post('/schema/convert', data),

  // Validate syntax only (no conversion)
  validateSyntax: (data: ConvertSchemaRequest) => apiClient.post('/schema/validate-syntax', data),

  // Quick fix syntax errors
  quickFixSyntax: (data: ConvertSchemaRequest) => apiClient.post('/schema/quick-fix', data),

  // Enhance with AI
  enhance: (data: EnhanceSchemaRequest) => apiClient.post('/schema/enhance', data),

  // Apply or undo a suggestion
  applySuggestion: (data: ApplySuggestionRequest) =>
    apiClient.post('/schema/suggestion/apply', data),

  // Recalculate quality score
  recalculateQuality: (data: RecalculateQualityRequest) =>
    apiClient.post('/schema/quality/recalculate', data),

  // Validate schema
  validate: (data: ValidateSchemaRequest) => apiClient.post('/schema/validate', data),

  // CRUD operations
  create: (data: CreateSchemaRequest) => apiClient.post('/schema', data),

  getById: (id: string) => apiClient.get(`/schema/${id}`),

  list: (params?: { userId?: string; status?: string; tags?: string }) =>
    apiClient.get('/schema', { params }),

  update: (id: string, data: UpdateSchemaRequest) => apiClient.put(`/schema/${id}`, data),

  delete: (id: string) => apiClient.delete(`/schema/${id}`),
};
