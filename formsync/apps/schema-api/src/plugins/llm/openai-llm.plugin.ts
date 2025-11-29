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
            content: `You are a JSON Schema expert. Your role is to enhance schemas by ADDING metadata only.

STRICT RULES YOU MUST FOLLOW:
1. NEVER modify: property names, types, enums, structure, required lists
2. NEVER replace existing "format" values (email, date, uri, etc.) with patterns
3. NEVER add constraints that contradict existing structure
4. ALWAYS preserve existing formats - they have higher priority than patterns
5. YOU MAY ONLY ADD: description, title (if missing), examples, x-accessibility
6. ADD patterns ONLY if NO format exists
7. ADD minLength/maxLength ONLY if not already present
8. EVERY field MUST have: description AND examples array

Return only valid JSON with the enhanced schema and changes array.`,
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
    const preserveStructure = options?.preserveStructure !== false;
    
    return `Enhance this JSON Schema by ADDING metadata only.

**ABSOLUTE RULES - BREAKING THESE IS FORBIDDEN**:

1. DO NOT MODIFY:
   - Property names (keep exact spelling/casing)
   - Property types (string stays string, number stays number)
   - Enum values (keep exact list)
   - Required arrays (do not add or remove fields)
   - Structure (object stays object, array stays array)
   - Existing "format" values (email, date, uri, etc.)

2. NEVER REPLACE FORMAT WITH PATTERN:
   - If field has "format": "email" - KEEP IT, do NOT add pattern
   - If field has "format": "date" - KEEP IT, do NOT add pattern
   - Format has HIGHEST priority - never override

3. YOU MAY ONLY ADD (if missing):
   - "description" (REQUIRED for every field)
   - "examples" (REQUIRED array with realistic examples)
   - "title" (only if not already present)
   - "x-accessibility" (metadata for screen readers)
   - "pattern" (ONLY if NO "format" exists)
   - "minLength"/"maxLength" (ONLY if not present and logical)
   - "minimum"/"maximum" (ONLY if not present and logical)

4. VALIDATION CONSTRAINTS:
   - Do NOT add maxLength if it could break existing data
   - Do NOT add pattern if format exists
   - Do NOT add constraints that contradict existing schema
   - Do NOT make fields more restrictive than original intent

5. REQUIRED FOR EVERY ENHANCED FIELD:
   - "description": "Clear explanation of the field"
   - "examples": ["realistic", "example", "values"]

${preserveStructure ? `6. PRESERVE STRUCTURE EXACTLY:
   - If schema is flat, keep it flat
   - Do NOT add wrapper objects
   - Do NOT restructure properties
   - Do NOT change property paths` : ''}

Original Schema:
${JSON.stringify(schema, null, 2)}

Enhancement Focus Areas: ${focusAreas.join(', ')}

Instructions:
${focusAreas.includes('descriptions') ? '- [REQUIRED] Add "description" to EVERY field\n' : ''}${focusAreas.includes('descriptions') ? '- [REQUIRED] Add "examples" array to EVERY field\n' : ''}${focusAreas.includes('naming') ? '- [OPTIONAL] Add "title" ONLY if missing (never modify existing)\n' : ''}${focusAreas.includes('validation') ? '- [CAREFUL] Add validation ONLY if compatible with existing format/type\n' : ''}${focusAreas.includes('validation') ? '- [CRITICAL] NEVER add pattern if "format" exists\n' : ''}${focusAreas.includes('accessibility') ? '- [OPTIONAL] Add "x-accessibility" metadata for screen readers\n' : ''}
Return JSON in this exact format:
{
  "schema": { ...enhanced schema with IDENTICAL structure... },
  "changes": [
    {
      "path": "properties.email.description",
      "originalValue": null,
      "newValue": "User email address",
      "changeType": "added",
      "reason": "Added description for clarity"
    },
    {
      "path": "properties.email.examples",
      "originalValue": null,
      "newValue": ["user@example.com"],
      "changeType": "added",
      "reason": "Added realistic example"
    }
  ]
}

REMEMBER:
- Keep ALL existing formats (email, date, uri, etc.)
- Add description + examples to EVERY field
- Do NOT modify structure or property names
- Do NOT replace formats with patterns`;
  }
}
