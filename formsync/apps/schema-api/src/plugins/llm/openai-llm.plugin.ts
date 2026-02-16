/**
 * OpenAI LLM Provider Plugin
 *
 * Uses OpenAI GPT models to enhance JSON Schemas
 * Improvements include: better field naming, validation rules,
 * accessibility metadata, and descriptions
 *
 * Design Decision: Uses OpenAI-compatible API format to allow
 * easy swapping with other providers (Azure OpenAI, Groq, local models, etc.)
 *
 * NOTE:
 * This plugin is a low-level LLM provider (transport layer).
 * Domain-specific schema intelligence is implemented in SchemaEnhancerService
 * for reusability, explainability, and quality scoring.
 */

import {
  LLMProviderPlugin,
  EnhancementResult,
  EnhancementOptions,
  SchemaEnhancement,
} from '@formsync/plugins';
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
        ...(baseURL && { baseURL }),
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
            content: `You are an expert JSON Schema quality analyst for JSON Schema Draft-07.

You will receive a JSON Schema (inputSchema).
Your task is to perform a COMPLETE, FIELD-BY-FIELD quality analysis and return improvement SUGGESTIONS ONLY.

IMPORTANT:
- You MUST NOT modify the input schema.
- You MUST return the schema EXACTLY as received.
- ALL improvements must be returned as suggestions.
- This is a human-in-the-loop system.

------------------------------------------------
OUTPUT FORMAT (STRICT — JSON ONLY)
------------------------------------------------
Return a single JSON object:

{
  "schema": { ...exact copy of input schema... },
  "suggestions": [ ... ]
}

------------------------------------------------
MANDATORY COVERAGE RULE
------------------------------------------------
You MUST evaluate:
- Every top-level property
- Every nested property
- Every object node itself (not only its children)

If ANY quality gap exists, you MUST generate a suggestion.

------------------------------------------------
QUALITY DIMENSIONS TO CHECK
------------------------------------------------

For EACH field and object node, check:

1. Validation completeness
2. Metadata completeness (description + examples)
3. Accessibility readiness
4. Structural correctness
5. Consistency and safety

------------------------------------------------
🔒 CRITICAL PRESERVATION RULES (MUST FOLLOW)
------------------------------------------------

NEVER suggest changes to fields that ALREADY have these user-defined properties:

1. DO NOT suggest different "pattern" if field already has pattern
2. DO NOT suggest different "minLength" if field already has minLength
3. DO NOT suggest different "maxLength" if field already has maxLength
4. DO NOT suggest different "minimum" if field already has minimum
5. DO NOT suggest different "maximum" if field already has maximum
6. DO NOT suggest different "enum" if field already has enum
7. DO NOT suggest different "format" if field already has format
8. DO NOT suggest weaker validation constraints
9. DO NOT replace user-provided descriptions with generic ones

ONLY suggest ADDING missing properties, NEVER replacing existing ones.

🚫 SKIP FIELDS THAT ARE ALREADY COMPLETE:

A field is COMPLETE if it has ALL of the following:
- ✅ description (non-empty, not "No description provided")
- ✅ examples (array with at least one value)
- ✅ At least one validation rule (pattern, minLength, minimum, format, etc.)
- ✅ x-accessibility (for user-input fields like string, number, boolean)

EXAMPLE - Field with complete metadata (SKIP IT):
{
  "email": {
    "type": "string",
    "pattern": "^[a-z0-9]+@example\\.com$",
    "description": "User email address",
    "examples": ["user@example.com"],
    "x-accessibility": { "label": "Email", "hint": "Enter your email" }
  }
}
→ NO SUGGESTIONS NEEDED - Field is complete ✅

EXAMPLE - Field missing only examples (SUGGEST):
{
  "name": {
    "type": "string",
    "minLength": 1,
    "description": "User full name",
    "x-accessibility": { "label": "Name", "hint": "Enter your name" }
  }
}
→ SUGGEST: Add examples: ["John Doe", "Jane Smith"]

EXAMPLE - Field missing validation (SUGGEST):
{
  "age": {
    "type": "integer",
    "description": "User age",
    "examples": [25, 30]
  }
}
→ SUGGEST: Add minimum: 0, maximum: 120

IMPORTANT: 
- If schema has x-formsync-metadata.enhanced = true, be EXTRA CAREFUL
- Most fields will already be complete
- Only suggest for genuinely missing properties
- User-defined constraints are SACRED. Only suggest additions to empty fields.

------------------------------------------------
VALIDATION SUGGESTIONS (HIGH PRIORITY)
------------------------------------------------

String fields:
- minLength (>=1)
- maxLength (reasonable defaults: 50 for names, 255 for text)
- format when applicable (email, date, uri)
- pattern when clearly applicable (phone, postalCode)

Number / integer fields:
- minimum / maximum when values must be bounded

Boolean fields:
- Suggest a default value (true or false) if missing

Array fields:
- minItems when array should not be empty
- uniqueItems when duplicates are unlikely

Object fields (IMPORTANT):
- Suggest minProperties: 1 when object should not be empty
- This applies even if child fields have validation

------------------------------------------------
METADATA SUGGESTIONS (MANDATORY)
------------------------------------------------

For EVERY field and object node:
- Suggest a description if missing
- Suggest examples if missing (CRITICAL FOR ALL FIELDS)
- Description must be a single, clear sentence

EXAMPLES SUGGESTIONS (MANDATORY):

For EVERY field WITHOUT examples array, you MUST suggest adding examples.

Example format by type:
- string (email) → examples: ["user@example.com", "admin@company.com"]
- string (generic) → examples: ["Sample text", "Example value"]
- string (name) → examples: ["John Doe", "Jane Smith"]
- string (phone) → examples: ["+1-234-567-8900"]
- string (date) → examples: ["2024-01-15"]
- number → examples: [100, 250, 500]
- integer → examples: [1, 10, 100]
- integer (age) → examples: [25, 30, 45]
- boolean → examples: [true, false]
- enum → examples: [firstEnumValue, secondEnumValue]
- array → examples: [["item1", "item2"]]

CRITICAL RULES FOR EXAMPLES:
1. Check EVERY field in the schema
2. If examples array is missing or empty → MUST generate suggestion
3. If examples array exists and has values → NO suggestion needed
4. Always provide 1-3 realistic example values
5. Example values must match the field type and format
6. Make examples domain-appropriate (e.g., realistic names, emails, dates)

EXAMPLE SUGGESTION FORMAT:
{
  "id": "metadata-properties.email-examples-<timestamp>",
  "path": "properties.email",
  "category": "metadata",
  "rule": {
    "examples": ["user@example.com", "admin@company.com"]
  },
  "description": "Add example values to demonstrate expected email format",
  "applied": false,
  "impactedDimensions": ["accessibility"],
  "estimatedImpact": 3
}

------------------------------------------------
ACCESSIBILITY SUGGESTIONS (MANDATORY — CRITICAL)
------------------------------------------------

For EVERY user-facing field, you MUST suggest x-accessibility if missing.

User-facing field types:
- string
- number
- integer
- boolean

Required x-accessibility structure:
{
  "x-accessibility": {
    "label": "<Human-readable field name>",
    "hint": "<Short usage instruction or guidance>"
  }
}

STRICT RULES:
1. Check EVERY string, number, integer, and boolean field
2. If x-accessibility is MISSING → Generate suggestion to add it
3. If x-accessibility exists but missing "hint" → Suggest adding hint
4. If x-accessibility is complete → No suggestion needed

DO NOT suggest x-accessibility for:
- object types (structural containers)
- array types (structural containers)
- Schema root
- Fields already having complete x-accessibility

EXAMPLES:

Field without accessibility:
{
  "email": { "type": "string", "format": "email" }
}
→ MUST suggest adding:
{
  "x-accessibility": {
    "label": "Email Address",
    "hint": "Enter a valid email address"
  }
}

Field with partial accessibility:
{
  "age": {
    "type": "integer",
    "x-accessibility": { "label": "Age" }
  }
}
→ MUST suggest adding hint:
{
  "x-accessibility": {
    "label": "Age",
    "hint": "Enter your age in years"
  }
}

Field with complete accessibility:
{
  "name": {
    "type": "string",
    "x-accessibility": {
      "label": "Full Name",
      "hint": "Enter your first and last name"
    }
  }
}
→ NO suggestion needed

CRITICAL: Accessibility suggestions are HIGH PRIORITY (estimatedImpact: 4-5).
Missing accessibility severely impacts schema quality and user experience.

------------------------------------------------
SUGGESTION OBJECT FORMAT (MANDATORY)
------------------------------------------------

Each suggestion MUST contain:

{
  "id": "<category>-<field-path>-<timestamp>",
  "path": "<full JSON path>",
  "category": "validation | accessibility | metadata | structure",
  "rule": { ...exact rule to apply... },
  "description": "<why this improves schema quality>",
  "applied": false,
  "impactedDimensions": [ ... ],
  "estimatedImpact": 1-5
}

PATH FORMAT RULES (CRITICAL):
- NEVER use a leading slash
- NEVER use forward slashes in paths
- ALWAYS use dot notation
- Correct: "properties.name"
- Correct: "properties.user.properties.email"
- Correct: "properties.address.properties.city"
- WRONG: "/properties/name"
- WRONG: "/properties/user/properties/email"
- WRONG: "properties/name"
- For root-level properties: "properties.fieldName"
- For nested properties: "properties.parent.properties.child"

------------------------------------------------
SCORING INTENT (IMPORTANT)
------------------------------------------------

estimatedImpact guidance:
- 5 → Major quality improvement
- 4 → High impact
- 3 → Moderate
- 2 → Minor
- 1 → Cosmetic

Validation and accessibility usually score higher.

------------------------------------------------
SAFETY RULES
------------------------------------------------

- Do NOT suggest rules already present
- Do NOT invent business logic
- Do NOT mark fields as required automatically
- Do NOT suggest conflicting rules
- Use full recursive paths (properties.personalData.properties.age)

------------------------------------------------
FINAL CHECK BEFORE RETURNING
------------------------------------------------

Before returning:
- Every object node has been evaluated
- Every field has been evaluated
- No missing descriptions are ignored
- JSON is valid
- Return JSON ONLY`,
          },
          { role: 'user', content: prompt },
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
          try {
            parsed = JSON.parse(jsonMatch[1]);
          } catch (err) {
            return {
              success: false,
              errors: ['AI returned non-JSON or unparsable JSON. Raw response provided.', rawText],
              changes: [],
            };
          }
        } else {
          return {
            success: false,
            errors: [
              'AI returned non-JSON content and no parsable JSON block found. Raw response provided.',
              rawText,
            ],
            changes: [],
          };
        }
      }

      const enhancedSchema = parsed.schema ?? schema; // Use original if not provided
      const suggestionsFromModel = parsed.suggestions ?? []; // Extract suggestions

      // Filter out invalid suggestions (defensive validation)
      const validSuggestions = suggestionsFromModel.filter((s: any) => {
        const isValid = 
          s.id && typeof s.id === 'string' &&
          s.path && typeof s.path === 'string' && s.path.trim() !== '' &&
          s.category && typeof s.category === 'string' &&
          s.rule && typeof s.rule === 'object' &&
          s.description && typeof s.description === 'string' &&
          typeof s.applied === 'boolean';
        
        if (!isValid) {
          console.warn('Filtered out invalid suggestion from AI:', s);
        }
        
        return isValid;
      });

      // No invariant validation needed since we're not modifying the schema

      return {
        success: true,
        enhancedSchema: schema, // Return original schema unchanged
        changes: [], // No auto-applied changes
        suggestions: validSuggestions, // Only valid suggestions
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

  const missingInEnh = origKeys.filter((k) => !enhKeys.includes(k));
  const addedInEnh = enhKeys.filter((k) => !origKeys.includes(k));
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
      if (origSet.size !== enhSet.size || [...origSet].some((v) => !enhSet.has(v))) {
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

/**
 * Auto-fill missing metadata (description only)
 * Examples are now generated as AI suggestions instead of auto-filled
 */
function autoFillMissingMeta(schema: any) {
  if (!isObject(schema)) return;
  const props = schema.properties ?? {};
  for (const [k, v] of Object.entries(props)) {
    if (!v) continue;
    
    // Only auto-fill description if missing
    if ((v as any).description == null) {
      (v as any).description = `No description provided for ${k}.`;
    }
    
    // DO NOT auto-fill examples - let AI generate them as suggestions
    // This ensures examples appear in the suggestions panel for user review
    
    if ((v as any).type === 'object' && (v as any).properties) {
      autoFillMissingMeta(v);
    }

    if ((v as any).type === 'array' && (v as any).items && (v as any).items.type === 'object') {
      autoFillMissingMeta((v as any).items);
    }
  }
}
