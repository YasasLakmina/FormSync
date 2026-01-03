/**
 * Schema Enhancement Engine Service
 *
 * This service encapsulates domain-specific schema intelligence including:
 * - Validation normalization
 * - Accessibility enrichment
 * - Invariant protection
 * - Quality scoring
 * - Explainability
 * - Suggestion management (NEW)
 *
 * Design Decision:
 * The underlying LLM plugin (e.g., OpenAI) handles model communication,
 * while this service provides reusable, explainable schema reasoning.
 * This separation ensures the AI logic is portable across different LLM providers.
 *
 * UPDATED FOR SUGGESTION-DRIVEN MODEL:
 * - AI returns safe auto-fixes AND suggestions separately
 * - Quality scoring is based on CURRENT state (base + applied suggestions)
 * - Suggestions are NOT auto-applied - human-in-the-loop control
 * - All operations are deterministic and traceable
 */

import { Injectable } from '@nestjs/common';
import { OpenAILLMPlugin } from '../plugins/llm/openai-llm.plugin';
import { EnhancementOptions } from '@formsync/plugins';
import { SchemaQualityEngine } from './schema-quality-engine';
import { SchemaSuggestionEngine } from './schema-suggestion.engine';
import {
  EnhancementResultWithSuggestions,
  SchemaSuggestion,
  ApplySuggestionRequest,
  ApplySuggestionResult,
} from './schema-suggestion.types';

export interface SchemaEnhancementEngineResult {
  enhancedSchema: any;
  explanations: Array<{
    path: string;
    action: string;
    reason: string;
  }>;
  qualityScore: number;
  warnings?: string[];
  model?: string;
  tokensUsed?: number;
}

@Injectable()
export class SchemaEnhancerService {
  constructor(
    private readonly llmPlugin: OpenAILLMPlugin,
    private readonly qualityEngine: SchemaQualityEngine,
    private readonly suggestionEngine: SchemaSuggestionEngine
  ) {}

  /**
   * Enhance a JSON Schema using AI with explainability and quality metrics
   * (UPDATED for suggestion-driven model)
   *
   * Returns:
   * - Enhanced schema (with safe auto-fixes ONLY)
   * - List of auto-applied changes
   * - List of AI suggestions (NOT auto-applied)
   * - Quality score for CURRENT state (no suggestions applied yet)
   */
  async enhanceSchema(
    schema: any,
    options?: EnhancementOptions
  ): Promise<EnhancementResultWithSuggestions> {
    // Delegate to LLM provider for raw AI enhancement + suggestions
    const result = await this.llmPlugin.enhanceSchema(schema, options);

    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Schema enhancement failed');
    }

    // Extract results
    const enhancedSchema = result.enhancedSchema;
    const changes = result.changes || [];
    const suggestions = result.suggestions || [];

    // Calculate quality score for CURRENT state (enhanced schema, NO suggestions applied)
    const quality = this.qualityEngine.evaluate(
      enhancedSchema,
      changes,
      [], // No suggestions applied yet
      suggestions // Total suggestions available
    );

    return {
      enhancedSchema,
      changes,
      suggestions,
      quality: {
        score: quality.score,
        breakdown: quality.breakdown,
        issues: quality.issues,
      },
      model: result.model,
      tokensUsed: result.tokensUsed,
    };
  }

  /**
   * Call LLM directly with a prompt (for Quick Fix and other utilities)
   */
  async callLLM(prompt: string, context: string = 'general'): Promise<string | null> {
    try {
      const completion = await this.llmPlugin['client'].chat.completions.create({
        model: this.llmPlugin['model'],
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that ${context === 'syntax-fix' ? 'fixes syntax errors in code' : 'helps with schema tasks'}.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Low temperature for deterministic fixes
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('[SchemaEnhancerService] LLM call failed:', error);
      return null;
    }
  }

  /**
   * Apply or undo a suggestion and recalculate quality score
   * (NEW method for suggestion-driven model)
   *
   * This method:
   * 1. Applies/undos the suggestion deterministically
   * 2. Recalculates quality score based on new state
   * 3. Returns updated schema, suggestion, and quality metrics
   *
   * CRITICAL: No AI call - completely deterministic
   */
  applySuggestion(
    baseSchema: any,
    suggestion: SchemaSuggestion,
    allSuggestions: SchemaSuggestion[],
    aiChanges: any[],
    action: 'apply' | 'undo'
  ): ApplySuggestionResult {
    // Validate suggestion
    this.suggestionEngine.validateSuggestion(suggestion);

    // Calculate the CURRENT schema state (base + all previously applied suggestions)
    const currentSchema = this.suggestionEngine.getCurrentSchemaState(baseSchema, allSuggestions);

    // Get quality score BEFORE this operation
    const beforeQuality = this.qualityEngine.evaluate(
      currentSchema,
      aiChanges,
      allSuggestions.filter((s) => s.applied),
      allSuggestions
    );

    // Apply or undo the suggestion
    let updatedSchema: any;
    const updatedSuggestion = { ...suggestion };

    if (action === 'apply') {
      if (suggestion.applied) {
        throw new Error('Suggestion is already applied');
      }
      updatedSchema = this.suggestionEngine.applySuggestion(currentSchema, suggestion);
      updatedSuggestion.applied = true;
    } else {
      if (!suggestion.applied) {
        throw new Error('Suggestion is not applied, cannot undo');
      }
      updatedSchema = this.suggestionEngine.undoSuggestion(currentSchema, suggestion);
      updatedSuggestion.applied = false;
    }

    // Update the suggestion list
    const updatedSuggestions = allSuggestions.map((s) =>
      s.id === suggestion.id ? updatedSuggestion : s
    );

    // Recalculate quality score AFTER the operation
    const afterQuality = this.qualityEngine.evaluate(
      updatedSchema,
      aiChanges,
      updatedSuggestions.filter((s) => s.applied),
      updatedSuggestions
    );

    // Calculate score delta
    const scoreDelta = afterQuality.score - beforeQuality.score;

    return {
      schema: updatedSchema,
      suggestion: updatedSuggestion,
      quality: {
        score: afterQuality.score,
        breakdown: afterQuality.breakdown,
        issues: afterQuality.issues,
      },
      scoreDelta,
    };
  }

  /**
   * Recalculate quality score for current schema state
   * (NEW helper method)
   *
   * Used when frontend needs to refresh quality metrics without
   * making any changes to suggestions.
   */
  recalculateQuality(baseSchema: any, allSuggestions: SchemaSuggestion[], aiChanges: any[]) {
    // Get current schema state
    const currentSchema = this.suggestionEngine.getCurrentSchemaState(baseSchema, allSuggestions);

    // Calculate quality
    return this.qualityEngine.evaluate(
      currentSchema,
      aiChanges,
      allSuggestions.filter((s) => s.applied),
      allSuggestions
    );
  }
}
