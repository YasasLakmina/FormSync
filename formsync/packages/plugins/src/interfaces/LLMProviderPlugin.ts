/**
 * LLMProviderPlugin Interface
 *
 * Plugins that implement this interface use AI/LLM services to enhance
 * JSON Schemas with better naming, validations, accessibility metadata, etc.
 *
 * Design Decision: The plugin returns:
 * 1. Enhanced schema (with SAFE auto-fixes applied)
 * 2. List of auto-applied changes
 * 3. List of SUGGESTIONS (not auto-applied, require human approval)
 *
 * This ensures human-in-the-loop AI governance and academic defensibility.
 */

export interface SchemaEnhancement {
  path: string; // JSON path to the enhanced field
  originalValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  reason: string; // AI's explanation for this change
}

/**
 * AI-generated suggestion (not auto-applied)
 */
export interface SchemaSuggestion {
  id: string; // Unique ID
  path: string; // JSON path to target field
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>; // Rule to apply (e.g., { "minLength": 1 })
  description: string; // Human-readable explanation
  applied: boolean; // Whether suggestion has been applied
  impactedDimensions?: Array<
    'structure' | 'validation' | 'accessibility' | 'consistency' | 'improvement'
  >;
  estimatedImpact?: number; // Optional: estimated score improvement
}

export interface EnhancementResult {
  success: boolean;
  enhancedSchema?: any; // The improved JSON Schema (with safe auto-fixes)
  changes: SchemaEnhancement[]; // List of auto-applied changes
  suggestions?: SchemaSuggestion[]; // NEW: List of AI suggestions (not auto-applied)
  errors?: string[];
  tokensUsed?: number; // Optional: track API usage
  model?: string; // Which AI model was used
}

export interface EnhancementOptions {
  focusAreas?: ('naming' | 'validation' | 'accessibility' | 'descriptions')[];
  preserveStructure?: boolean; // If true, don't add/remove fields
  targetLanguage?: string; // For i18n descriptions
}

export interface LLMProviderPlugin {
  /**
   * Unique identifier for this LLM provider plugin
   */
  readonly name: string;

  /**
   * Enhance a JSON Schema using AI
   * @param schema - Original JSON Schema to enhance
   * @param options - Enhancement preferences
   * @returns EnhancementResult with improved schema, changes, and suggestions
   */
  enhanceSchema(schema: any, options?: EnhancementOptions): Promise<EnhancementResult>;

  /**
   * Get the provider name (e.g., "OpenAI", "Azure OpenAI")
   * @returns Provider identifier
   */
  getProviderName(): string;

  /**
   * Check if the provider is properly configured
   * @returns true if API keys and config are valid
   */
  isConfigured(): boolean;
}
