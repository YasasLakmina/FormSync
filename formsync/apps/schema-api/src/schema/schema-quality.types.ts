/**
 * Schema Quality Types
 *
 * Type definitions for the Schema Quality Scoring Engine
 */

export interface QualityResult {
  score: number;
  breakdown: QualityBreakdown;
  issues: string[];
  appliedSuggestionsCount?: number; // NEW: Number of applied suggestions
  totalSuggestionsCount?: number; // NEW: Total suggestions available
}

export interface QualityBreakdown {
  structure: number;
  validation: number;
  accessibility: number;
  consistency: number;
  improvement: number;
}

export interface SchemaProperty {
  type?: string | string[];
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
  required?: string[];
  enum?: any[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  format?: string;
  description?: string;
  'x-accessibility'?: {
    label?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
