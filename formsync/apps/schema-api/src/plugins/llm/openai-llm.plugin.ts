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
    
    return `You are a JSON Schema enhancement expert. Your task is to analyze a JSON Schema and suggest improvements.

**CRITICAL INSTRUCTIONS - READ CAREFULLY**:
1. **DO NOT MODIFY THE SCHEMA** - Return the ORIGINAL schema completely unchanged in the "schema" field
2. **ALL ENHANCEMENTS GO IN THE "changes" ARRAY** - Each enhancement should be a separate item in the changes array
3. **NEVER put suggestions, descriptions, or placeholder text directly into the schema values**
4. **Each change must have a clear path, original value, new value, change type, and reason**

Original Schema to analyze:
${JSON.stringify(schema, null, 2)}

Focus Areas: ${focusAreas.join(', ')}

Enhancement Guidelines:
${focusAreas.includes('naming') ? '- Suggest adding clear "title" properties for better field labels (DO NOT modify field names)' : ''}
${focusAreas.includes('validation') ? '- Suggest adding validation rules: pattern for emails, minLength/maxLength for text, minimum/maximum for numbers, etc.' : ''}
${focusAreas.includes('accessibility') ? '- Suggest adding "title" and "description" properties for screen reader support' : ''}
${focusAreas.includes('descriptions') ? '- Suggest adding helpful "description" properties explaining field purpose' : ''}

**RESPONSE FORMAT**:
{
  "schema": <RETURN THE ORIGINAL SCHEMA EXACTLY AS PROVIDED - DO NOT MODIFY IT>,
  "changes": [
    <LIST OF INDIVIDUAL ENHANCEMENT SUGGESTIONS - EACH AS A SEPARATE ITEM>
  ]
}

**CHANGES ARRAY FORMAT - EACH ITEM MUST FOLLOW THIS STRUCTURE**:
{
  "path": "properties.fieldName.propertyToAdd",
  "originalValue": null,  // or the existing value if modifying
  "newValue": "the suggested value",
  "changeType": "added",  // or "modified" or "removed"
  "reason": "Brief explanation of why this enhancement improves the schema"
}

**EXAMPLES OF CORRECT CHANGES**:

Example 1 - Adding a title:
{
  "path": "properties.username.title",
  "originalValue": null,
  "newValue": "Username",
  "changeType": "added",
  "reason": "Added user-friendly label for better accessibility"
}

Example 2 - Adding a description:
{
  "path": "properties.email.description",
  "originalValue": null,
  "newValue": "User's email address for account communication",
  "changeType": "added",
  "reason": "Added description to clarify field purpose"
}

Example 3 - Adding email validation:
{
  "path": "properties.email.pattern",
  "originalValue": null,
  "newValue": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$",
  "changeType": "added",
  "reason": "Added regex pattern to validate email format"
}

Example 4 - Adding minLength:
{
  "path": "properties.password.minLength",
  "originalValue": null,
  "newValue": 8,
  "changeType": "added",
  "reason": "Added minimum length requirement for password security"
}

Example 5 - Adding x-accessibility metadata:
{
  "path": "properties.age.x-accessibility",
  "originalValue": null,
  "newValue": {
    "label": "Age in years",
    "hint": "Enter your age as a number"
  },
  "changeType": "added",
  "reason": "Added accessibility metadata for screen readers and assistive technologies"
}

**VALIDATION CHECKLIST** (verify before responding):
✓ The "schema" field contains the ORIGINAL schema unchanged
✓ The "changes" array contains multiple individual suggestions
✓ Each change has all required fields: path, originalValue, newValue, changeType, reason
✓ No suggestions are embedded in the schema itself
✓ Each enhancement is a separate item in the changes array
✓ Paths are in dot notation format (e.g., "properties.fieldName.title")

Now analyze the provided schema and return your response in the exact JSON format specified above.`;
  }
}
