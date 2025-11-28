/**
 * LLMProviderPlugin Interface
 * 
 * Plugins that implement this interface use AI/LLM services to enhance
 * JSON Schemas with better naming, validations, accessibility metadata, etc.
 * 
 * Design Decision: The plugin returns both the enhanced schema and a list
 * of changes made, allowing the UI to show diffs and let users review changes.
 */

export interface SchemaEnhancement {
  path: string; // JSON path to the enhanced field
  originalValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
  reason: string; // AI's explanation for this change
}

export interface EnhancementResult {
  success: boolean;
  enhancedSchema?: any; // The improved JSON Schema
  changes: SchemaEnhancement[]; // List of all changes made
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
   * @returns EnhancementResult with improved schema and change list
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
