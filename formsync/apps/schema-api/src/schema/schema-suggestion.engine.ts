/**
 * Schema Suggestion Engine
 *
 * Deterministic apply/undo operations for AI-generated suggestions.
 *
 * Design Decision:
 * This engine is COMPLETELY DETERMINISTIC - no AI calls during apply/undo.
 * Operations are reversible, traceable, and safe.
 *
 * Key Principles:
 * 1. Apply: Deep-merge suggestion.rule into schema at suggestion.path
 * 2. Undo: Remove ONLY the specific fields added by the suggestion
 * 3. Never affect unrelated schema properties
 * 4. Fully traceable and explainable
 *
 * Academic Justification:
 * - Determinism ensures reproducibility
 * - Reversibility enables experimentation without risk
 * - Separation from AI ensures human control
 */

import { Injectable } from '@nestjs/common';
import { SchemaSuggestion } from './schema-suggestion.types';
import * as _ from 'lodash';

@Injectable()
export class SchemaSuggestionEngine {
  /**
   * Apply a suggestion to a schema
   *
   * Algorithm:
   * 1. Locate the target field using suggestion.path
   * 2. Deep-merge suggestion.rule into that field
   * 3. Return updated schema
   *
   * Example:
   * Path: "properties.user.properties.name"
   * Rule: { "minLength": 1 }
   * Result: schema.properties.user.properties.name.minLength = 1
   *
   * @param schema - The current schema
   * @param suggestion - The suggestion to apply
   * @returns Updated schema with suggestion applied
   */
  applySuggestion(schema: any, suggestion: SchemaSuggestion): any {
    // Deep clone to avoid mutation
    const updatedSchema = _.cloneDeep(schema);

    // Parse the path and navigate to target
    const pathParts = this.parsePath(suggestion.path);
    const target = this.navigateToPath(updatedSchema, pathParts);

    if (!target) {
      throw new Error(`Invalid path: ${suggestion.path}. Target not found in schema.`);
    }

    // Deep merge the rule into the target
    // This preserves existing properties while adding new ones
    Object.assign(target, suggestion.rule);

    return updatedSchema;
  }

  /**
   * Undo a suggestion from a schema
   *
   * Algorithm:
   * 1. Locate the target field using suggestion.path
   * 2. Remove ONLY the keys defined in suggestion.rule
   * 3. Do NOT remove other properties
   *
   * Example:
   * Path: "properties.user.properties.name"
   * Rule: { "minLength": 1 }
   * Result: delete schema.properties.user.properties.name.minLength
   *
   * @param schema - The current schema (with suggestion applied)
   * @param suggestion - The suggestion to undo
   * @returns Updated schema with suggestion removed
   */
  undoSuggestion(schema: any, suggestion: SchemaSuggestion): any {
    // Deep clone to avoid mutation
    const updatedSchema = _.cloneDeep(schema);

    // Parse the path and navigate to target
    const pathParts = this.parsePath(suggestion.path);
    const target = this.navigateToPath(updatedSchema, pathParts);

    if (!target) {
      // If path doesn't exist, suggestion was never applied - return as-is
      return updatedSchema;
    }

    // Remove ONLY the keys from suggestion.rule
    for (const key of Object.keys(suggestion.rule)) {
      delete target[key];
    }

    return updatedSchema;
  }

  /**
   * Apply multiple suggestions in sequence
   *
   * @param schema - The base schema
   * @param suggestions - Array of suggestions to apply
   * @returns Schema with all suggestions applied
   */
  applyMultipleSuggestions(schema: any, suggestions: SchemaSuggestion[]): any {
    let currentSchema = schema;

    for (const suggestion of suggestions) {
      if (suggestion.applied) {
        currentSchema = this.applySuggestion(currentSchema, suggestion);
      }
    }

    return currentSchema;
  }

  /**
   * Get the current schema state based on applied suggestions
   *
   * This is useful for recalculating quality scores:
   * - Start with base enhanced schema (with safe auto-fixes)
   * - Apply only the suggestions marked as applied: true
   * - Return the resulting schema for scoring
   *
   * @param baseSchema - The enhanced schema (with auto-fixes, no suggestions)
   * @param allSuggestions - All suggestions (both applied and not applied)
   * @returns Schema reflecting current state
   */
  getCurrentSchemaState(baseSchema: any, allSuggestions: SchemaSuggestion[]): any {
    const appliedSuggestions = allSuggestions.filter((s) => s.applied);
    return this.applyMultipleSuggestions(baseSchema, appliedSuggestions);
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Parse a JSON path string into parts
   *
   * Example:
   * "properties.user.properties.name" → ["properties", "user", "properties", "name"]
   *
   * @param path - Dot-separated path string
   * @returns Array of path segments
   */
  private parsePath(path: string): string[] {
    return path.split('.').filter((p) => p.length > 0);
  }

  /**
   * Navigate to a path in the schema object
   *
   * @param obj - The schema object
   * @param pathParts - Array of path segments
   * @returns The target object, or null if path is invalid
   */
  private navigateToPath(obj: any, pathParts: string[]): any {
    let current = obj;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        // Path doesn't exist
        return null;
      }
    }

    return current;
  }

  /**
   * Validate that a suggestion is well-formed
   *
   * @param suggestion - The suggestion to validate
   * @returns true if valid, throws error otherwise
   */
  validateSuggestion(suggestion: SchemaSuggestion): boolean {
    if (!suggestion.id || typeof suggestion.id !== 'string') {
      throw new Error('Suggestion must have a valid id');
    }

    if (!suggestion.path || typeof suggestion.path !== 'string') {
      throw new Error('Suggestion must have a valid path');
    }

    if (!suggestion.category) {
      throw new Error('Suggestion must have a category');
    }

    if (!suggestion.rule || typeof suggestion.rule !== 'object') {
      throw new Error('Suggestion must have a rule object');
    }

    if (typeof suggestion.applied !== 'boolean') {
      throw new Error('Suggestion must have an applied boolean');
    }

    return true;
  }

  /**
   * Create a suggestion ID
   *
   * Format: {category-prefix}-{path-kebab}-{timestamp}
   * Example: "val-user-name-1734123456"
   *
   * @param category - Suggestion category
   * @param path - Schema path
   * @returns Generated suggestion ID
   */
  generateSuggestionId(category: string, path: string): string {
    const categoryPrefix =
      {
        validation: 'val',
        accessibility: 'acc',
        structure: 'struct',
        metadata: 'meta',
      }[category] || 'sug';

    // Convert path to kebab-case
    const pathKebab = path
      .replace(/properties\./g, '')
      .replace(/items\./g, '')
      .replace(/\./g, '-')
      .toLowerCase();

    const timestamp = Date.now();

    return `${categoryPrefix}-${pathKebab}-${timestamp}`;
  }
}
