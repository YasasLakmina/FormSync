/**
 * OpenAI LLM Provider Plugin
 * 
 * Uses OpenAI GPT models to enhance JSON Schemas
 * Improvements include: better field naming, validation rules,
 * accessibility metadata, and descriptions
 * 
 * Design Decision: Uses OpenAI-compatible API format to allow
 * easy swapping with other providers (Azure OpenAI, Groq, local models, etc.)
 */

import { LLMProviderPlugin, EnhancementResult, EnhancementOptions, SchemaEnhancement } from '@formsync/plugins';
import OpenAI from 'openai';

export class OpenAILLMPlugin implements LLMProviderPlugin {
  readonly name = 'openai-llm';
  private client: OpenAI | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL; // Support for Groq and other OpenAI-compatible APIs
    this.model = process.env.OPENAI_MODEL || 'gpt-4';

    if (apiKey) {
      // Initialize with custom base URL if provided (for Groq, etc.)
      this.client = new OpenAI({ 
        apiKey,
        ...(baseURL && { baseURL })
      });
    }
  }

  async enhanceSchema(schema: any, options?: EnhancementOptions): Promise<EnhancementResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        errors: ['OpenAI API key not configured'],
        changes: [],
      };
    }

    try {
      const prompt = this.buildPrompt(schema, options);
      
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a JSON Schema expert. Enhance the provided schema with better naming, validation rules, accessibility metadata, and descriptions. Return only valid JSON with the enhanced schema and a changes array.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        success: true,
        enhancedSchema: result.schema || schema,
        changes: result.changes || [],
        tokensUsed: response.usage?.total_tokens,
        model: this.model,
      };
    } catch (error) {
      console.error('OpenAI enhancement error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`AI enhancement failed: ${errorMessage}`],
        changes: [],
      };
    }
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  private buildPrompt(schema: any, options?: EnhancementOptions): string {
    const focusAreas = options?.focusAreas || ['naming', 'validation', 'accessibility', 'descriptions'];
    
    return `Enhance this JSON Schema with focus on: ${focusAreas.join(', ')}.

**CRITICAL RULES**:
1. PRESERVE all existing field names - do NOT rename or remove fields
2. PRESERVE the existing structure - do NOT add wrapper objects
3. ONLY enhance the existing fields with better metadata

Original Schema:
${JSON.stringify(schema, null, 2)}

Instructions:
${focusAreas.includes('naming') ? '- Keep field names unchanged, but add clear titles' : ''}
${focusAreas.includes('validation') ? '- Add missing validation rules (pattern for emails, minLength for passwords, etc.)' : ''}
${focusAreas.includes('accessibility') ? '- Add title and description to each field for screen readers' : ''}
${focusAreas.includes('descriptions') ? '- Add helpful descriptions explaining what each field is for' : ''}
- Do NOT restructure, wrap, or rename existing properties
- Do NOT add new properties unless validations/metadata
- Keep the schema flat if it was flat originally

Return JSON in this format:
{
  "schema": { ...enhanced schema with SAME structure... },
  "changes": [
    {
      "path": "properties.fieldName.title",
      "originalValue": null,
      "newValue": "Field Title",
      "changeType": "added",
      "reason": "Added screen reader label"
    }
  ]
}`;
  }
}
