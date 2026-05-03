/**
 * Service Registry
 *
 * Central configuration for all downstream microservices.
 * All URLs are read from environment variables with sensible defaults.
 */

export interface ServiceConfig {
  name: string;
  url: string;
  description: string;
  healthPath: string;
}

export const SERVICES: Record<string, ServiceConfig> = {
  schemaEnhancementEngine: {
    name: 'schema-enhancement-engine',
    url: process.env.SCHEMA_ENGINE_URL || 'http://localhost:3010',
    description: 'Schema conversion, AI enhancement, validation & CRUD',
    healthPath: '/health',
  },
  userManagementService: {
    name: 'user-management-service',
    url: process.env.USER_SERVICE_URL || 'http://localhost:3011',
    description: 'User authentication, JWT, and template management',
    healthPath: '/health',
  },
  backendDtoGenerator: {
    name: 'backend-dto-generator',
    url: process.env.DTO_GENERATOR_URL || 'http://localhost:3012',
    description: 'Generates Java/Spring Boot DTO code from JSON Schema',
    healthPath: '/health',
  },
  runtimeBindingEngine: {
    name: 'runtime-binding-engine',
    url: process.env.RUNTIME_ENGINE_URL || 'http://localhost:3013',
    description: 'Generates complete Spring Boot server from JSON Schema',
    healthPath: '/health',
  },
  formgenService: {
    name: 'formgen-service',
    url: process.env.FORMGEN_SERVICE_URL || 'http://localhost:3014',
    description: 'React app ZIP and fullstack orchestration (React or static HTML)',
    healthPath: '/health',
  },
  nodeBackendGenerator: {
    name: 'node-backend-generator',
    url: process.env.NODE_BACKEND_GENERATOR_URL || 'http://localhost:3015',
    description: 'Generates Express JavaScript backend from JSON Schema',
    healthPath: '/health',
  },
  dotnetBackendGenerator: {
    name: 'dotnet-backend-generator',
    url: process.env.DOTNET_BACKEND_GENERATOR_URL || 'http://localhost:3016',
    description: 'Generates ASP.NET Core Web API backend from JSON Schema',
    healthPath: '/health',
  },
  staticFrontendGenerator: {
    name: 'static-frontend-generator',
    url: process.env.STATIC_FRONTEND_GENERATOR_URL || 'http://localhost:3017',
    description: 'Generates static HTML + Bootstrap + JavaScript from FormModel',
    healthPath: '/health',
  },
};
