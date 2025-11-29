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
