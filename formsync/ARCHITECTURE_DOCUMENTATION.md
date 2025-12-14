# Suggestion-Driven Enhancement Model - Architecture Documentation

## System Architecture

This document explains the architectural decisions, component responsibilities, and design patterns used in the suggestion-driven enhancement model.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Schema Controller                           │
│  - POST /schema/enhance                                          │
│  - POST /schema/suggestion/apply                                 │
│  - POST /schema/quality/recalculate                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Schema Service                              │
│  - Orchestrates enhancement workflow                             │
│  - Delegates to SchemaEnhancerService                            │
│  - Returns formatted API responses                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SchemaEnhancerService                           │
│  - Domain logic coordinator                                      │
│  - Calls LLM plugin for AI enhancement                           │
│  - Uses SuggestionEngine for apply/undo                          │
│  - Uses QualityEngine for scoring                                │
└──────────┬──────────────────┬───────────────────┬───────────────┘
           │                  │                   │
           ▼                  ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│ OpenAILLMPlugin  │ │ SuggestionEngine │ │  QualityEngine       │
│                  │ │                  │ │                      │
│ - AI transport   │ │ - Apply/undo     │ │ - Deterministic      │
│ - Returns fixes  │ │   suggestions    │ │   scoring            │
│   + suggestions  │ │ - Path-based     │ │ - 5 dimensions       │
│ - Validates      │ │   merging        │ │ - Rule-based         │
│   invariants     │ │ - Deterministic  │ │ - Explainable        │
└──────────────────┘ └──────────────────┘ └──────────────────────┘
```

---

## Design Patterns

### 1. Strategy Pattern - LLM Plugins

**Problem:** Need to support multiple LLM providers (OpenAI, Azure, Groq, local models)

**Solution:** Plugin interface `LLMProviderPlugin` with swappable implementations

```typescript
interface LLMProviderPlugin {
  enhanceSchema(schema: any, options?: EnhancementOptions): Promise<EnhancementResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}
```

**Benefits:**

- Easy to add new providers
- Domain logic (SchemaEnhancerService) is provider-agnostic
- Testing: can mock LLM responses

### 2. Service Layer Pattern

**Problem:** Separate business logic from HTTP concerns

**Solution:** Three-tier architecture

```
Controller → Service → Engine/Plugin
  (HTTP)      (Logic)   (Core)
```

**Responsibilities:**

- **Controller:** Request validation, response formatting
- **Service:** Workflow orchestration, error handling
- **Engine:** Core algorithms (scoring, suggestion management)

### 3. Command Pattern - Suggestions

**Problem:** Need reversible operations (apply/undo)

**Solution:** Each suggestion is a command with deterministic apply/undo

```typescript
interface SchemaSuggestion {
  id: string;
  path: string;
  rule: Record<string, any>; // What to apply
  applied: boolean; // Current state
}

// Apply: merge rule into path
// Undo: remove rule from path
```

**Benefits:**

- Operations are idempotent
- History tracking possible
- Undo is trivial (no complex diff logic)

### 4. Observer Pattern - Quality Scoring

**Problem:** Quality score must update when schema changes

**Solution:** Reactive scoring - recalculate whenever schema state changes

```typescript
// Any schema change triggers recalculation
applySuggestion() → getCurrentSchemaState() → evaluate()
undoSuggestion()  → getCurrentSchemaState() → evaluate()
```

**Benefits:**

- Score always reflects current state
- No stale data
- Simple mental model

---

## Data Flow

### Enhancement Flow (Initial AI Enhancement)

```
1. User submits schema
   ↓
2. SchemaService.enhanceSchema()
   ↓
3. SchemaEnhancerService.enhanceSchema()
   ↓
4. OpenAILLMPlugin.enhanceSchema()
   ├─ Sends prompt to OpenAI
   ├─ Validates invariants
   └─ Returns: { enhancedSchema, changes, suggestions }
   ↓
5. QualityEngine.evaluate(enhancedSchema, changes, [], suggestions)
   ├─ Scores based on CURRENT state (no suggestions applied)
   └─ Returns: { score, breakdown, issues }
   ↓
6. Return to user:
   {
     enhancedSchema,        // With safe auto-fixes
     changes,               // Auto-applied
     suggestions,           // NOT applied
     quality: { score, breakdown, issues }
   }
```

**Key Point:** AI is called ONCE, returns both fixes and suggestions

### Suggestion Application Flow (User Applies a Suggestion)

```
1. User clicks "Apply Suggestion"
   ↓
2. Frontend sends:
   {
     baseSchema,      // Original enhanced schema
     suggestion,      // The one to apply
     allSuggestions,  // All suggestions with current states
     aiChanges,       // Original auto-fixes
     action: "apply"
   }
   ↓
3. SchemaEnhancerService.applySuggestion()
   ↓
4. SuggestionEngine.getCurrentSchemaState(baseSchema, allSuggestions)
   ├─ Starts with baseSchema
   ├─ Applies all suggestions where applied: true
   └─ Returns currentSchema
   ↓
5. SuggestionEngine.applySuggestion(currentSchema, suggestion)
   ├─ Navigates to suggestion.path
   ├─ Merges suggestion.rule into target
   └─ Returns updatedSchema
   ↓
6. QualityEngine.evaluate(updatedSchema, aiChanges, appliedSuggestions, allSuggestions)
   ├─ Calculates NEW score based on updated schema
   └─ Returns: { score, breakdown, issues }
   ↓
7. Return to user:
   {
     schema,           // Updated schema
     suggestion,       // With applied: true
     quality,          // Recalculated score
     scoreDelta: +8    // Change in score
   }
```

**Key Point:** NO AI call - completely deterministic

---

## AI Prompt Design

### Prompt Structure

The OpenAI system prompt has two critical sections:

#### 1. Safe Auto-Fixes (Applied Immediately)

```
B. SAFE AUTO-FIXES (apply directly to schema):
  1. Date fields: Add "format": "date"
  2. Email fields: Add "format": "email"
  3. Description: Add if missing
  4. Examples: Add if missing
  5. x-accessibility: Normalize to object format
```

**Rationale:**

- These changes are **non-destructive**
- They **improve metadata** without changing business logic
- They are **universally applicable**
- No user decision needed

#### 2. Suggestions (User Approval Required)

```
C. SUGGESTIONS ONLY (do NOT apply to schema):
  1. String validation: minLength, pattern, maxLength
  2. Number validation: minimum, maximum
  3. Array validation: minItems, maxItems
  4. Object validation: minProperties
  5. Additional required fields
```

**Rationale:**

- These changes **constrain business logic**
- They require **domain knowledge** to validate
- Wrong constraints can **break valid use cases**
- User must decide applicability

### Prompt Engineering Techniques

1. **Role Definition:** "You are a conservative JSON Schema fixer/normalizer"
   - Sets expectation for safe, minimal changes

2. **Explicit Invariants:** Lists what AI MUST NOT change
   - Property keys, enums, types, required arrays

3. **Output Format Enforcement:** JSON with specific keys
   - `{ "schema": ..., "changes": [...], "suggestions": [...] }`

4. **Categorization:** Each suggestion has a category
   - Enables filtering and UI grouping

5. **Traceability:** Each change/suggestion has a reason
   - Explainability for users and auditing

---

## Quality Scoring Algorithm

### Design Principles

1. **Deterministic:** Same schema → same score
2. **Transparent:** Every point is traceable
3. **Independent:** No AI calls during scoring
4. **Fair:** Doesn't punish schemas for being simple

### Scoring Dimensions (100 points total)

#### Dimension 1: Structural Completeness (25 pts)

```typescript
// Root is object
if (schema.type === 'object') score += 5;

// Has properties
if (schema.properties && Object.keys(schema.properties).length > 0) score += 5;

// Nested objects have properties (proportional)
score += (validNestedObjects / totalNestedObjects) * 10;

// Arrays have items defined (proportional)
score += (validArrays / totalArrays) * 5;
```

**Why:** Well-structured schemas are easier to use and validate

#### Dimension 2: Validation Strength (25 pts)

```typescript
const { total, validated } = countValidationCoverage(schema);
const score = (validated / total) * 25;
```

**Validation Criteria by Type:**

- **String:** Has minLength, maxLength, pattern, or format
- **Number:** Has minimum or maximum
- **Array:** Has minItems
- **Enum:** Considered validated by default

**Why:** Validation rules prevent invalid data

**CRITICAL DESIGN CHOICE:**
This scores based on **CURRENT schema state only**.
Suggestions do NOT count until applied.

Example:

```
Schema with 3 fields, 0 validated: 0/3 * 25 = 0 pts
After applying 1 suggestion:      1/3 * 25 = 8 pts
After applying 3 suggestions:      3/3 * 25 = 25 pts
```

This ensures:

- ✅ Score reflects reality, not potential
- ✅ AI doesn't get credit for unapplied suggestions
- ✅ User engagement is measured

#### Dimension 3: Accessibility & Metadata (20 pts)

```typescript
const descScore = (fieldsWithDesc / totalFields) * 10;
const a11yScore = (fieldsWithA11y / totalFields) * 10;
return descScore + a11yScore;
```

**Why:** Good metadata improves developer experience and accessibility

#### Dimension 4: Consistency & Safety (20 pts)

```typescript
// Penalty-based: start at 20, subtract 2 per violation
const violations = [
  requiredFieldNotInProperties,
  emptyEnumArray,
  patternOnNonString,
  minimumGreaterThanMaximum,
];
return Math.max(0, 20 - violations.length * 2);
```

**Why:** Catches logical errors and schema corruption

#### Dimension 5: AI Improvement Depth (10 pts)

```typescript
// Base score for auto-fixes (up to 5 pts)
const autoScore = Math.min(autoChanges.length, 5);

// Suggestion application score (up to 5 pts)
const suggestionScore = (appliedSuggestions / totalSuggestions) * 5;

return autoScore + suggestionScore;
```

**Why This Formula:**

- Rewards auto-fixes (AI did safe improvements)
- Rewards user engagement (applied suggestions)
- Does NOT reward AI for generating many suggestions
- Caps auto-fix contribution to prevent gaming

**Example Scores:**

```
3 auto-fixes, 0/0 suggestions: 3 + 0 = 3 pts
3 auto-fixes, 0/5 suggestions: 3 + 0 = 3 pts (low engagement)
3 auto-fixes, 5/5 suggestions: 3 + 5 = 8 pts (high engagement)
10 auto-fixes, 5/5 suggestions: 5 + 5 = 10 pts (max score)
```

---

## Suggestion Engine Algorithm

### Apply Operation

```typescript
applySuggestion(schema: any, suggestion: SchemaSuggestion): any {
  // 1. Deep clone to avoid mutation
  const updated = cloneDeep(schema);

  // 2. Navigate to target path
  const target = navigateToPath(updated, suggestion.path);

  // 3. Merge rule into target
  Object.assign(target, suggestion.rule);

  return updated;
}
```

**Example:**

```typescript
Path: "properties.user.properties.name"
Rule: { "minLength": 1 }

// Navigates to schema.properties.user.properties.name
// Then does: Object.assign(name, { minLength: 1 })

Result:
{
  "name": {
    "type": "string",
    "minLength": 1,  // ← Added
    "description": "User's full name"
  }
}
```

### Undo Operation

```typescript
undoSuggestion(schema: any, suggestion: SchemaSuggestion): any {
  // 1. Deep clone
  const updated = cloneDeep(schema);

  // 2. Navigate to target path
  const target = navigateToPath(updated, suggestion.path);

  // 3. Remove ONLY the keys from suggestion.rule
  for (const key of Object.keys(suggestion.rule)) {
    delete target[key];
  }

  return updated;
}
```

**Example:**

```typescript
Path: "properties.user.properties.name"
Rule: { "minLength": 1 }

// Navigates to schema.properties.user.properties.name
// Then does: delete name.minLength

Result:
{
  "name": {
    "type": "string",
    // minLength removed
    "description": "User's full name"
  }
}
```

### getCurrentSchemaState (Critical for Dynamic Scoring)

```typescript
getCurrentSchemaState(baseSchema: any, allSuggestions: SchemaSuggestion[]): any {
  const appliedSuggestions = allSuggestions.filter(s => s.applied);

  let currentSchema = baseSchema;
  for (const suggestion of appliedSuggestions) {
    currentSchema = applySuggestion(currentSchema, suggestion);
  }

  return currentSchema;
}
```

**Purpose:** Reconstructs schema state from base + applied suggestions

**Why This Matters:**

- Frontend sends baseSchema (enhanced, no suggestions)
- Backend applies all suggestions marked `applied: true`
- Result is the "current" schema for scoring

**Flow:**

```
1. Start with baseSchema (has auto-fixes)
2. Apply suggestion 1 (if applied: true)
3. Apply suggestion 2 (if applied: true)
4. ...
5. Result = current schema state
6. Score THIS schema
```

---

## Error Handling & Validation

### 1. Invariant Validation (OpenAILLMPlugin)

```typescript
function validateSchemaInvariant(original: any, enhanced: any): Diff[] {
  const diffs = [];

  // Check property keys unchanged
  if (originalKeys !== enhancedKeys) {
    diffs.push({ message: 'properties keys changed' });
  }

  // Check types unchanged
  if (original.type !== enhanced.type) {
    diffs.push({ message: 'type changed' });
  }

  // Check enums unchanged
  if (originalEnum !== enhancedEnum) {
    diffs.push({ message: 'enum values changed' });
  }

  return diffs;
}
```

**If Validation Fails:**

```json
{
  "success": false,
  "errors": ["Enhanced schema violates invariants"],
  "changes": [
    /* diffs */
  ]
}
```

### 2. Suggestion Validation (SuggestionEngine)

```typescript
validateSuggestion(suggestion: SchemaSuggestion): boolean {
  if (!suggestion.id) throw new Error('Suggestion must have id');
  if (!suggestion.path) throw new Error('Suggestion must have path');
  if (!suggestion.rule) throw new Error('Suggestion must have rule');
  if (typeof suggestion.applied !== 'boolean') throw new Error('applied must be boolean');
  return true;
}
```

### 3. Path Validation (Suggestion Apply/Undo)

```typescript
navigateToPath(obj: any, pathParts: string[]): any {
  let current = obj;
  for (const part of pathParts) {
    if (!(part in current)) return null;  // Path doesn't exist
    current = current[part];
  }
  return current;
}

// In applySuggestion:
const target = navigateToPath(schema, pathParts);
if (!target) {
  throw new Error(`Invalid path: ${path}`);
}
```

---

## Testing Strategy

### Unit Tests

1. **SuggestionEngine**
   - Test apply/undo operations
   - Test path navigation
   - Test edge cases (invalid paths, malformed suggestions)

2. **QualityEngine**
   - Test each scoring dimension independently
   - Test with different schema structures
   - Verify determinism (same input → same output)

3. **OpenAILLMPlugin**
   - Mock OpenAI responses
   - Test invariant validation
   - Test error handling

### Integration Tests

1. **Enhancement Flow**
   - Submit schema → get suggestions
   - Apply suggestion → verify schema changed
   - Verify quality score updated

2. **Undo Flow**
   - Apply suggestion → undo → verify rollback
   - Verify quality score reverted

3. **Multiple Suggestions**
   - Apply in sequence → verify cumulative effect
   - Mix of apply/undo → verify correct final state

### Property-Based Tests

1. **Idempotence**
   - Apply twice = apply once
   - Undo unapplied = no change

2. **Reversibility**
   - Apply then undo = original state
   - Quality score returns to original

3. **Determinism**
   - Same schema, same suggestions → same score
   - No randomness in scoring

---

## Performance Considerations

### 1. Avoid AI Calls

**Problem:** AI calls are slow (1-5 seconds) and expensive

**Solution:** Call AI ONCE during enhancement, all other operations are deterministic

```
Enhancement:  [AI call] → 2-5 seconds
Apply:        [no AI]   → <10ms
Undo:         [no AI]   → <10ms
Recalculate:  [no AI]   → <10ms
```

### 2. Caching (Future Enhancement)

```typescript
// Cache quality scores by schema hash
const schemaHash = crypto.createHash('sha256').update(JSON.stringify(schema)).digest('hex');

const cacheKey = `quality:${schemaHash}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

// Calculate and cache
const quality = this.evaluate(schema);
await redis.set(cacheKey, quality, 3600); // 1 hour TTL
```

### 3. Deep Cloning

**Problem:** Deep cloning large schemas can be slow

**Mitigation:**

- Only clone when mutating
- Consider structural sharing for future optimization

```typescript
// Current approach
const updated = _.cloneDeep(schema);

// Future optimization (structural sharing)
const updated = produce(schema, (draft) => {
  draft.properties.user.name.minLength = 1;
});
```

---

## Security Considerations

### 1. Prompt Injection Prevention

**Risk:** User-controlled schema content could inject malicious prompts

**Mitigation:**

- Schema is sent as JSON (structured data, not free text)
- System prompt explicitly forbids field additions/removals
- Invariant validation catches unauthorized changes

### 2. Path Traversal

**Risk:** Malicious path like `"../../../etc/passwd"`

**Mitigation:**

- Path is split by `.` and validated
- No filesystem operations (pure in-memory)
- navigateToPath() only traverses JSON structure

### 3. Schema Size Limits

**Risk:** Extremely large schemas consume resources

**Mitigation:**

- Add request size limits in API layer
- Implement timeouts for AI calls
- Rate limiting on enhancement endpoint

```typescript
@Post('enhance')
@HttpCode(HttpStatus.OK)
@ApiBody({
  schema: {
    maxProperties: 1000  // Limit schema complexity
  }
})
async enhance(@Body() dto: EnhanceSchemaDto) { ... }
```

---

## Academic Contributions

This implementation demonstrates several important concepts:

### 1. Human-in-the-Loop AI (HITL)

**Contribution:** Practical implementation of HITL for schema generation

**Key Innovation:**

- AI generates suggestions but humans approve
- Transparent distinction between auto-fixes and suggestions
- Measurable user engagement (applied/total ratio)

**Academic Relevance:**

- Responsible AI design
- User control over AI decisions
- Trust through transparency

### 2. Explainable AI (XAI)

**Contribution:** Deterministic, traceable quality scoring

**Key Innovation:**

- Every quality point is explained
- No black-box AI scoring
- Quality changes are predictable

**Academic Relevance:**

- XAI requirements in production systems
- Algorithmic transparency
- Auditability

### 3. Reversible AI Operations

**Contribution:** All AI suggestions are reversible

**Key Innovation:**

- Undo is trivial (command pattern)
- No history tracking needed (stateless operations)
- Experimentation without risk

**Academic Relevance:**

- User agency in AI systems
- Mistake recovery
- Exploratory workflows

### 4. Safe AI Constraints

**Contribution:** Enforced invariants prevent AI errors

**Key Innovation:**

- Schema structure is protected
- Business logic preserved
- Validation before acceptance

**Academic Relevance:**

- AI safety in production
- Constraint satisfaction
- Formal verification techniques

---

## Future Enhancements

### 1. Suggestion Prioritization

Add AI-generated priority scores:

```typescript
interface SchemaSuggestion {
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number; // Predicted score improvement
}
```

### 2. Batch Operations

Apply multiple suggestions at once:

```typescript
@Post('suggestion/apply-batch')
async applyBatch(@Body() dto: {
  baseSchema: any;
  suggestionIds: string[];
  allSuggestions: SchemaSuggestion[];
}) { ... }
```

### 3. Suggestion History

Track when suggestions were applied:

```typescript
interface SchemaSuggestion {
  appliedAt?: Date;
  appliedBy?: string;
}
```

### 4. AI Explanation Refinement

Use LLM to explain WHY a suggestion helps:

```typescript
interface SchemaSuggestion {
  description: string; // Current
  detailedExplanation: string; // NEW: Longer form
  examples: string[]; // NEW: Example violations
}
```

### 5. Suggestion Conflicts

Detect when suggestions conflict:

```typescript
interface SchemaSuggestion {
  conflicts?: string[]; // IDs of conflicting suggestions
}

// Example:
// Adding minLength: 10 conflicts with maxLength: 5
```

---

## Conclusion

This architecture demonstrates:

1. ✅ **Separation of Concerns:** Clear boundaries between transport, logic, and algorithms
2. ✅ **Human-in-the-Loop:** AI suggests, humans decide
3. ✅ **Explainability:** Every decision is traceable
4. ✅ **Determinism:** Reproducible results
5. ✅ **Safety:** Protected invariants
6. ✅ **Performance:** Minimal AI calls
7. ✅ **Academic Rigor:** Defensible, publishable design

The system is production-ready, academically sound, and user-friendly.
