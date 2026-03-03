/**
 * Local type definitions for schema-api.
 *
 * These interfaces were previously imported from the shared @formsync/plugins
 * workspace package. They are inlined here so schema-api has zero coupling to
 * any shared package, making it a fully self-contained microservice.
 */

// ─── Parser types ────────────────────────────────────────────────────────────

export interface ParseResult {
  success: boolean;
  schema?: any;
  errors?: string[];
  detectedFormat?: 'json' | 'yaml' | 'xml' | 'unknown';
}

export interface FormatParserPlugin {
  readonly name: string;
  canParse(input: string): boolean;
  parse(input: string): Promise<ParseResult>;
  getSupportedFormats(): string[];
}

// ─── Validator types ──────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  path: string;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  success: boolean;
  issues: ValidationIssue[];
  validatorName: string;
  timestamp: Date;
}

export interface SchemaValidatorPlugin {
  readonly name: string;
  validate(schema: any): Promise<ValidationResult>;
  getValidatorName(): string;
  getDescription(): string;
}

// ─── LLM / Enhancement types ──────────────────────────────────────────────────

export interface SchemaEnhancement {
  path: string;
  originalValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  reason: string;
}

export interface SchemaSuggestion {
  id: string;
  path: string;
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>;
  description: string;
  applied: boolean;
  impactedDimensions?: Array<
    'structure' | 'validation' | 'accessibility' | 'consistency' | 'improvement'
  >;
  estimatedImpact?: number;
}

export interface EnhancementResult {
  success: boolean;
  enhancedSchema?: any;
  changes: SchemaEnhancement[];
  suggestions?: SchemaSuggestion[];
  errors?: string[];
  tokensUsed?: number;
  model?: string;
}

export interface EnhancementOptions {
  focusAreas?: ('naming' | 'validation' | 'accessibility' | 'descriptions')[];
  preserveStructure?: boolean;
  targetLanguage?: string;
}

export interface LLMProviderPlugin {
  readonly name: string;
  enhanceSchema(schema: any, options?: EnhancementOptions): Promise<EnhancementResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}
