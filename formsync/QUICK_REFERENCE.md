# Quick Reference - Suggestion-Driven Enhancement Model

## Core Concepts

### 1. Two Types of AI Output

| Type                | Auto-Applied? | Examples                                              | User Action Required? |
| ------------------- | ------------- | ----------------------------------------------------- | --------------------- |
| **Safe Auto-Fixes** | ✅ Yes        | descriptions, examples, x-accessibility, email format | ❌ No                 |
| **Suggestions**     | ❌ No         | minLength, pattern, minimum, maximum                  | ✅ Yes                |

### 2. Suggestion Lifecycle

```
Created (applied: false)
    ↓
User reviews
    ↓
Apply (applied: true) → Schema updated → Quality score recalculated
    ↓
Optional: Undo (applied: false) → Changes reversed → Score reverted
```

### 3. Quality Score Formula

**Total: 100 points**

```
Structure (25)      = Root structure + properties + nested completeness
Validation (25)     = (validatedFields / totalFields) * 25
Accessibility (20)  = (descriptions + a11y labels) / 2
Consistency (20)    = 20 - (violations * 2)
Improvement (10)    = min(autoFixes, 5) + (appliedSuggestions/total * 5)
```

---

## API Quick Reference

### POST /schema/enhance

**What it does:** Initial AI enhancement

**Returns:**

- Enhanced schema (with auto-fixes)
- List of auto-applied changes
- List of suggestions (NOT applied)
- Quality score for current state

**AI Call:** ✅ Yes (once)

**Example Response:**

```json
{
  "enhancedSchema": {
    /* ... */
  },
  "suggestions": [
    {
      "id": "val-user-name-1734123456",
      "path": "properties.user.properties.name",
      "category": "validation",
      "rule": { "minLength": 1 },
      "description": "Add minimum length to prevent empty name",
      "applied": false
    }
  ],
  "qualityScore": 68
}
```

---

### POST /schema/suggestion/apply

**What it does:** Apply or undo a suggestion, recalculate quality

**Parameters:**

- `baseSchema` - Original enhanced schema
- `suggestion` - The suggestion to apply/undo
- `allSuggestions` - All suggestions with current states
- `aiChanges` - Original auto-fixes
- `action` - "apply" or "undo"

**Returns:**

- Updated schema
- Updated suggestion (toggled applied flag)
- Recalculated quality score
- Score delta

**AI Call:** ❌ No (deterministic)

**Example Response:**

```json
{
  "schema": {
    /* updated */
  },
  "suggestion": {
    /* applied: true */
  },
  "qualityScore": 76,
  "scoreDelta": +8
}
```

---

### POST /schema/quality/recalculate

**What it does:** Refresh quality score without changes

**Parameters:**

- `baseSchema`
- `allSuggestions` (with current applied states)
- `aiChanges`

**Returns:**

- Current quality score
- Breakdown by dimension
- Issues list
- Suggestion counts

**AI Call:** ❌ No (deterministic)

---

## TypeScript Types

### SchemaSuggestion

```typescript
interface SchemaSuggestion {
  id: string; // Unique identifier
  path: string; // JSON path (e.g., "properties.user.properties.name")
  category: 'validation' | 'accessibility' | 'structure' | 'metadata';
  rule: Record<string, any>; // What to apply (e.g., { "minLength": 1 })
  description: string; // Human-readable explanation
  applied: boolean; // Current state
  impactedDimensions?: string[]; // Which quality dimensions this affects
}
```

### Quality Result

```typescript
interface QualityResult {
  score: number; // 0-100
  breakdown: {
    structure: number; // 0-25
    validation: number; // 0-25
    accessibility: number; // 0-20
    consistency: number; // 0-20
    improvement: number; // 0-10
  };
  issues: string[];
  appliedSuggestionsCount?: number;
  totalSuggestionsCount?: number;
}
```

---

## File Locations

| File                                                     | Purpose          |
| -------------------------------------------------------- | ---------------- |
| `apps/schema-api/src/schema/schema-suggestion.types.ts`  | Type definitions |
| `apps/schema-api/src/schema/schema-suggestion.engine.ts` | Apply/undo logic |
| `apps/schema-api/src/schema/schema-quality-engine.ts`    | Quality scoring  |
| `apps/schema-api/src/schema/schema-enhancer.service.ts`  | Orchestration    |
| `apps/schema-api/src/plugins/llm/openai-llm.plugin.ts`   | AI provider      |
| `apps/schema-api/src/schema/schema.controller.ts`        | API endpoints    |

---

## Common Operations

### 1. Initial Enhancement

```typescript
const response = await fetch('/schema/enhance', {
  method: 'POST',
  body: JSON.stringify({ schema: originalSchema }),
});

const { enhancedSchema, suggestions, qualityScore } = await response.json();
```

### 2. Apply a Suggestion

```typescript
const response = await fetch('/schema/suggestion/apply', {
  method: 'POST',
  body: JSON.stringify({
    baseSchema: enhancedSchema,
    suggestion: suggestions[0],
    allSuggestions: suggestions,
    aiChanges: originalChanges,
    action: 'apply',
  }),
});

const { schema, qualityScore, scoreDelta } = await response.json();
```

### 3. Undo a Suggestion

```typescript
// Same as apply, but action: 'undo'
const response = await fetch('/schema/suggestion/apply', {
  method: 'POST',
  body: JSON.stringify({
    baseSchema: enhancedSchema,
    suggestion: appliedSuggestion,
    allSuggestions: suggestions,
    aiChanges: originalChanges,
    action: 'undo', // ← Different action
  }),
});
```

---

## Quality Score Interpretation

| Score  | Rating    | Meaning                                      |
| ------ | --------- | -------------------------------------------- |
| 90-100 | Excellent | All fields validated, documented, accessible |
| 70-89  | Good      | Most improvements applied, minor gaps        |
| 50-69  | Fair      | Basic structure, limited validations         |
| 0-49   | Poor      | Missing metadata, no validations             |

---

## Suggestion Categories

| Category        | What It Includes                               | Auto-Applied?                                            |
| --------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `validation`    | minLength, pattern, minimum, maximum, minItems | ❌ No                                                    |
| `accessibility` | Additional a11y metadata                       | Depends (normalization is auto, additions are suggested) |
| `structure`     | Schema organization improvements               | ❌ No                                                    |
| `metadata`      | Descriptions, examples                         | ✅ Yes (auto-fixes)                                      |

---

## Score Impact Examples

### Example 1: Minimal Schema

```
Input: { type: "object", properties: { name: { type: "string" } } }

After Enhancement (0/1 suggestions applied):
- Structure: 25 (full)
- Validation: 0 (no validations)
- Accessibility: 20 (auto-fixed)
- Consistency: 20 (no violations)
- Improvement: 3 (auto-fixes only)
- Total: 68

After Applying Suggestion (1/1 suggestions applied):
- Validation: 25 (1/1 fields validated)
- Improvement: 8 (auto-fixes + 100% suggestions)
- Total: 98 (+30)
```

### Example 2: Complex Schema (3 fields)

```
After Enhancement (0/3 suggestions):
- Validation: 0
- Improvement: 3
- Total: 68

After 1 suggestion (1/3):
- Validation: 8 (+8)
- Improvement: 5 (+2)
- Total: 76 (+8)

After 2 suggestions (2/3):
- Validation: 17 (+9)
- Improvement: 6 (+1)
- Total: 85 (+9)

After 3 suggestions (3/3):
- Validation: 25 (+8)
- Improvement: 8 (+2)
- Total: 93 (+8)
```

---

## Key Constraints (DO NOT VIOLATE)

### ✅ AI Can Do (Safe)

- Add descriptions
- Add examples
- Normalize x-accessibility to object format
- Add format to email/date fields

### ❌ AI Cannot Do (Protected)

- Add or remove property keys
- Change enum values
- Modify required arrays
- Change types (string → number)
- Alter business logic

### 🤔 AI Can Suggest (User Decides)

- Add validation rules
- Add required constraints
- Add minItems to arrays
- Add minProperties to objects

---

## Troubleshooting

### Issue: Quality score not updating after apply

**Solution:** Ensure you're sending updated `allSuggestions` with toggled `applied` flag

### Issue: Suggestion path not found

**Solution:** Verify path format (use `.` separator, e.g., `properties.user.properties.name`)

### Issue: Undo doesn't work

**Solution:** Ensure suggestion has `applied: true` before attempting undo

### Issue: AI returns no suggestions

**Solution:** Check that schema has fields that need validation (strings, numbers, arrays)

---

## Performance Tips

1. **Cache enhanced schemas** - AI call is slowest operation (2-5s)
2. **Batch suggestion applications** - If applying many, group them
3. **Debounce quality recalculation** - Don't recalculate on every keystroke
4. **Use baseSchema + suggestions pattern** - Avoid re-enhancement

---

## Academic Keywords

This implementation demonstrates:

- **Human-in-the-Loop AI** (HITL)
- **Explainable AI** (XAI)
- **Deterministic Operations**
- **Reversible Actions**
- **Constraint Satisfaction**
- **Rule-Based Scoring**
- **Separation of Concerns**
- **Command Pattern**
- **Transparent Metrics**

---

## Quick Checklist for Frontend Integration

- [ ] Display suggestions as a list
- [ ] Add "Apply" button for each suggestion (when `applied: false`)
- [ ] Add "Undo" button for each suggestion (when `applied: true`)
- [ ] Show quality score prominently
- [ ] Show score delta when suggestion is applied/undone
- [ ] Display quality breakdown (5 dimensions)
- [ ] Show issues list
- [ ] Indicate which suggestions impact which dimensions
- [ ] Track suggestion states (`applied` flag)
- [ ] Show applied/total suggestion count

---

## Further Reading

- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Complete overview
- [SUGGESTION_MODEL_EXAMPLES.md](SUGGESTION_MODEL_EXAMPLES.md) - Detailed API examples
- [ARCHITECTURE_DOCUMENTATION.md](ARCHITECTURE_DOCUMENTATION.md) - Deep technical dive

---

## Support

For questions or issues:

1. Check the examples in `SUGGESTION_MODEL_EXAMPLES.md`
2. Review architecture in `ARCHITECTURE_DOCUMENTATION.md`
3. Examine inline code comments in implementation files
