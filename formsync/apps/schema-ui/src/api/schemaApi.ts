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

export const schemaApi = {
  // Convert schema
  convert: (data: ConvertSchemaRequest) => 
    apiClient.post('/schema/convert', data),

  // Enhance with AI
  enhance: (data: EnhanceSchemaRequest) => 
    apiClient.post('/schema/enhance', data),

  // Validate schema
  validate: (data: ValidateSchemaRequest) => 
    apiClient.post('/schema/validate', data),

  // CRUD operations
  create: (data: CreateSchemaRequest) => 
    apiClient.post('/schema', data),

  getById: (id: string) => 
    apiClient.get(`/schema/${id}`),

  list: (params?: { userId?: string; status?: string; tags?: string }) => 
    apiClient.get('/schema', { params }),

  update: (id: string, data: UpdateSchemaRequest) => 
    apiClient.put(`/schema/${id}`, data),

  delete: (id: string) => 
    apiClient.delete(`/schema/${id}`),
};
