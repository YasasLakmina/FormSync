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

      // call the model (defensively accept different shapes)
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a robust, conservative JSON Schema fixer/normalizer for JSON Schema Draft-07.
You will receive a single object named inputSchema (a JSON Schema).

Your job: produce a high-quality, non-destructive "fixed" schema by applying only safe normalization and metadata-filling rules. Never invent or remove business fields or change enums/types. Return JSON only.

OUTPUT FORMAT (required)
Return a single JSON object:
{
  "schema": { ...the fixed schema... },
  "changes": [
    { "path": "properties.email.format", "changeType": "added", "originalValue": null, "newValue": "email", "reason": "Added email format" }
  ]
}

PROCESSING RULES (STRICT — must follow)

A. Absolute invariants — do NOT change:
  1. Property keys (names/casing) — do not rename, remove or add property keys
  2. Enum values and order — must remain exactly as input
  3. Existing required arrays — do not remove or add required entries
  4. Object ↔ array structure — do not convert object to array or vice-versa
  5. Types — preserve existing types (string stays string, number stays number)

B. Allowed safe corrections (apply ONLY when clearly needed):
  1. Date fields: If property name/title contains "date" and lacks format, add "format": "date"
  2. Email fields: If name/title contains "email" and format missing, add "format": "email"
  3. Numbers: Preserve minimum/maximum. Add realistic examples if missing
  4. Arrays: If array is required and minItems missing, set "minItems": 1

C. Metadata to add to every property (recursively):
  1. Description: If missing, add one-sentence description from property name
  2. Examples: If missing, add 1-2 realistic examples based on type/format:
       - email → ["user@example.com"]
       - date → ["1990-01-01"]
       - number → [1] or use minimum
       - enum → [firstEnumValue]
  3. x-accessibility: If exists as string, convert to object: { "label": "<string>", "hint": "" }

D. Postal code & phone heuristics:
  1. postalCode: Add pattern ^[0-9A-Za-z \\-]{1,10}$ if missing and maxLength exists
  2. phone: Add example like "123-456-7890"

E. Nested structures:
  1. Apply rules recursively to nested properties and items.properties
  2. Do not overwrite existing description, examples, format, pattern

F. Validation:
  1. After fixes, ensure invariants (A) still hold
  2. If any fix would violate invariants, skip it and note in changes as "rejected"

Return only the JSON object with "schema" and "changes" keys.`,
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      // defensive extraction of JSON result
      let rawText = '';
      if ((response as any).choices?.[0]?.message?.content) {
        rawText = (response as any).choices[0].message.content;
      } else if ((response as any).output) {
        rawText = JSON.stringify((response as any).output);
      } else {
        rawText = JSON.stringify(response);
      }

      // try to parse — if parse fails, attempt to extract JSON block
      let parsed: any;
      try {
        parsed = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
      } catch (e) {
        const jsonMatch = rawText.match(/(\{[\s\S]*\})/m);
        if (jsonMatch) {
          try { parsed = JSON.parse(jsonMatch[1]); } 
          catch (err) {
            return {
              success: false,
              errors: ['AI returned non-JSON or unparsable JSON. Raw response provided.', rawText],
              changes: [],
            };
          }
        } else {
          return {
            success: false,
            errors: ['AI returned non-JSON content and no parsable JSON block found. Raw response provided.', rawText],
            changes: [],
          };
        }
      }

      const enhancedSchema = parsed.schema ?? parsed; // accept either { schema: ... } or direct schema
      const changesFromModel = parsed.changes ?? [];

      // VALIDATION: compare original schema -> enhancedSchema for invariants
      const diffs = validateSchemaInvariant(schema, enhancedSchema);
      if (diffs.length > 0) {
        return {
          success: false,
          errors: ['Enhanced schema violates invariants. See diffs for details.'],
          changes: diffs,
        };
      }

      // SANITIZATION: Ensure every field has description + examples (auto-add placeholders if missing)
      autoFillMissingMeta(enhancedSchema);

      return {
        success: true,
        enhancedSchema,
        changes: (changesFromModel.length ? changesFromModel : []),
        tokensUsed: (response as any).usage?.total_tokens,
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
    return `Please fix and normalize this JSON Schema following the rules provided in the system prompt.

Input Schema (inputSchema):
${JSON.stringify(schema, null, 2)}

Focus areas: ${options?.focusAreas?.join(', ') || 'all'}

Return the result in the specified JSON format with "schema" and "changes" keys.`;
  }
}

// Helper functions for defensive schema validation

function isObject(x: any) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function validateSchemaInvariant(original: any, enhanced: any, path = ''): Array<any> {
  const diffs: any[] = [];

  if (!isObject(original) || !isObject(enhanced)) {
    return diffs;
  }

  // compare required arrays at this level (if present in original)
  if (Array.isArray(original.required)) {
    const origReq = original.required.slice().sort();
    const enhReq = Array.isArray(enhanced.required) ? enhanced.required.slice().sort() : [];
    if (JSON.stringify(origReq) !== JSON.stringify(enhReq)) {
      diffs.push({
        path: path || '/',
        message: 'required array changed',
        original: origReq,
        enhanced: enhReq,
      });
    }
  }

  const origProps = original.properties ?? {};
  const enhProps = enhanced.properties ?? {};
  const origKeys = Object.keys(origProps);
  const enhKeys = Object.keys(enhProps);

  const missingInEnh = origKeys.filter(k => !enhKeys.includes(k));
  const addedInEnh = enhKeys.filter(k => !origKeys.includes(k));
  if (missingInEnh.length || addedInEnh.length) {
    diffs.push({
      path: path || '/',
      message: 'properties keys changed',
      missingInEnhanced: missingInEnh,
      addedInEnhanced: addedInEnh,
    });
    return diffs;
  }

  for (const key of origKeys) {
    const origProp = origProps[key];
    const enhProp = enhProps[key];
    const propPath = path ? `${path}.properties.${key}` : `properties.${key}`;

    const origType = origProp?.type;
    const enhType = enhProp?.type;
    if (origType !== enhType) {
      diffs.push({
        path: propPath,
        message: 'type changed',
        originalType: origType,
        enhancedType: enhType,
      });
      continue;
    }

    if (Array.isArray(origProp?.enum)) {
      const origSet = new Set(origProp.enum);
      const enhEnum = Array.isArray(enhProp?.enum) ? enhProp.enum : [];
      const enhSet = new Set(enhEnum);
      if (origSet.size !== enhSet.size || [...origSet].some(v => !enhSet.has(v))) {
        diffs.push({
          path: propPath,
          message: 'enum values changed',
          originalEnum: origProp.enum,
          enhancedEnum: enhEnum,
        });
      }
    }

    if (origProp?.format) {
      if (enhProp?.format !== origProp.format) {
        diffs.push({
          path: propPath,
          message: 'format changed or removed',
          originalFormat: origProp.format,
          enhancedFormat: enhProp?.format ?? null,
        });
      }
    }

    if (origType === 'object') {
      const childDiffs = validateSchemaInvariant(origProp, enhProp, propPath);
      diffs.push(...childDiffs);
    }

    if (origType === 'array') {
      const origItems = origProp.items ?? {};
      const enhItems = enhProp.items ?? {};
      if ((origItems.type ?? null) !== (enhItems.type ?? null)) {
        diffs.push({
          path: `${propPath}.items`,
          message: 'items.type changed',
          original: origItems.type,
          enhanced: enhItems.type,
        });
      }
      if (origItems.type === 'object') {
        const childDiffs = validateSchemaInvariant(origItems, enhItems, `${propPath}.items`);
        diffs.push(...childDiffs);
      }
    }
  }

  return diffs;
}

function autoFillMissingMeta(schema: any) {
  if (!isObject(schema)) return;
  const props = schema.properties ?? {};
  for (const [k, v] of Object.entries(props)) {
    if (!v) continue;
    if ((v as any).description == null) {
      (v as any).description = `No description provided for ${k}.`;
    }
    if (!Array.isArray((v as any).examples) || (v as any).examples.length === 0) {
      let example: any = null;
      switch ((v as any).type) {
        case 'string': example = ((v as any).format === 'email') ? 'user@example.com' : ((v as any).enum?.[0] ?? `${k} example`); break;
        case 'number': example = ((v as any).minimum ?? 1); break;
        case 'array': example = []; break;
        case 'object': example = {}; break;
        default: example = null;
      }
      (v as any).examples = example != null ? [example] : [];
    }

    if ((v as any).type === 'object' && (v as any).properties) {
      autoFillMissingMeta(v);
    }

    if ((v as any).type === 'array' && (v as any).items && (v as any).items.type === 'object') {
      autoFillMissingMeta((v as any).items);
    }
  }
}
