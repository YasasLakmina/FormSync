/**
 * Schema Suggestion Types
 *
 * Type definitions for the AI-driven Suggestion Engine
 *
 * Design Decision:
 * Suggestions are PROPOSED improvements that require human approval.
 * They are NOT auto-applied, preserving human-in-the-loop control
 * and ensuring academic defensibility of the AI system.
 *
 * Key Architectural Principles:
 * 1. AI suggests, humans decide
 * 2. All suggestion applications are deterministic and reversible
 * 3. Quality scoring is based on APPLIED suggestions, not proposed ones
 * 4. Each suggestion is traceable and explainable
 */

/**
 * Categories of schema improvements
 *
 * - validation: Rules that constrain values (minLength, pattern, etc.)
 * - accessibility: Metadata for assistive technologies
 * - structure: Changes to schema organization (NOT field additions/removals)
 * - metadata: Descriptive information (descriptions, titles, examples)
 */
export type SuggestionCategory = 'validation' | 'accessibility' | 'structure' | 'metadata';

/**
 * Represents a single AI-generated suggestion
 *
 * Lifecycle:
 * 1. Created by AI during enhancement (applied: false)
 * 2. User reviews and applies (applied: true)
 * 3. User can undo (applied: false)
 */
export interface SchemaSuggestion {
  /**
   * Unique identifier for the suggestion
   * Format: {category}-{fieldPath}-{timestamp}
   * Example: "val-user-name-1734123456"
   */
  id: string;

  /**
   * JSON path to the field this suggestion targets
   * Example: "properties.user.properties.name"
   */
  path: string;

  /**
   * Category of improvement
   */
  category: SuggestionCategory;

  /**
   * The rule/property to add
   * Example: { "minLength": 1 } or { "pattern": "^[a-z]+$" }
   *
   * Note: This is a partial schema fragment to be merged into the target path
   */
  rule: Record<string, any>;

  /**
   * Human-readable explanation of why this suggestion improves the schema
   * Example: "Add minimum length to prevent empty name"
   */
  description: string;

  /**
   * Whether the suggestion has been applied to the schema
   * Default: false (suggestions are not auto-applied)
   */
  applied: boolean;

  /**
   * Optional: Which quality dimensions this suggestion impacts
   * Used for explaining score changes when suggestion is applied
   */
  impactedDimensions?: Array<
    'structure' | 'validation' | 'accessibility' | 'consistency' | 'improvement'
  >;

  /**
   * Optional: Estimated score improvement if applied
   * This is a STATIC estimate, not a dynamic calculation
   */
  estimatedImpact?: number;
}

/**
 * Extended enhancement result that includes suggestions
 */
export interface EnhancementResultWithSuggestions {
  /**
   * The schema with SAFE auto-fixes applied
   * (descriptions, examples, accessibility normalization)
   */
  enhancedSchema: any;

  /**
   * List of auto-applied safe changes
   */
  changes: Array<{
    path: string;
    changeType: string;
    originalValue: any;
    newValue: any;
    reason: string;
  }>;

  /**
   * List of AI-generated suggestions (NOT auto-applied)
   * User must explicitly apply these
   */
  suggestions: SchemaSuggestion[];

  /**
   * Quality metrics for the CURRENT state (with auto-fixes, without suggestions)
   */
  quality: {
    score: number;
    breakdown: {
      structure: number;
      validation: number;
      accessibility: number;
      consistency: number;
      improvement: number;
    };
    issues: string[];
  };

  /**
   * Metadata about the AI operation
   */
  model?: string;
  tokensUsed?: number;
}

/**
 * Request to apply or undo a suggestion
 */
export interface ApplySuggestionRequest {
  /**
   * The current schema (with or without suggestions already applied)
   */
  schema: any;

  /**
   * The suggestion to apply/undo
   */
  suggestion: SchemaSuggestion;

  /**
   * Action to perform
   */
  action: 'apply' | 'undo';
}

/**
 * Result of applying/undoing a suggestion
 */
export interface ApplySuggestionResult {
  /**
   * The updated schema
   */
  schema: any;

  /**
   * Updated suggestion (with applied flag toggled)
   */
  suggestion: SchemaSuggestion;

  /**
   * Recalculated quality score
   */
  quality: {
    score: number;
    breakdown: {
      structure: number;
      validation: number;
      accessibility: number;
      consistency: number;
      improvement: number;
    };
    issues: string[];
  };

  /**
   * Change in quality score
   * Positive = improvement, Negative = degradation
   */
  scoreDelta: number;
}
