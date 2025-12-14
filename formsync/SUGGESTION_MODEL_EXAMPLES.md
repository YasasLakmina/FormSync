# Suggestion-Driven Enhancement Model - Examples & Documentation

## Overview

This document demonstrates the suggestion-driven enhancement model with real examples showing:

1. API request/response before applying suggestions
2. API request/response after applying suggestions
3. Quality score changes
4. Academic justification

---

## Example 1: Complete Workflow

### Input Schema (Original)

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "age": {
          "type": "number"
        }
      }
    }
  }
}
```

---

## Step 1: POST /schema/enhance

### Request

```json
{
  "schema": {
    /* input schema above */
  }
}
```

### Response (Initial Enhancement - No Suggestions Applied)

```json
{
  "enhancedSchema": {
    "type": "object",
    "properties": {
      "user": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "User's full name",
            "examples": ["John Doe"],
            "x-accessibility": {
              "label": "Name",
              "hint": "Enter your full name"
            }
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "User's email address",
            "examples": ["user@example.com"],
            "x-accessibility": {
              "label": "Email",
              "hint": "Enter your email address"
            }
          },
          "age": {
            "type": "number",
            "description": "User's age in years",
            "examples": [25],
            "x-accessibility": {
              "label": "Age",
              "hint": "Enter your age"
            }
          }
        }
      }
    }
  },
  "changes": [
    {
      "path": "properties.user.properties.name.description",
      "changeType": "added",
      "originalValue": null,
      "newValue": "User's full name",
      "reason": "Added description (safe auto-fix)"
    },
    {
      "path": "properties.user.properties.email.format",
      "changeType": "added",
      "originalValue": null,
      "newValue": "email",
      "reason": "Added email format (safe auto-fix)"
    },
    {
      "path": "properties.user.properties.name.x-accessibility",
      "changeType": "added",
      "originalValue": null,
      "newValue": { "label": "Name", "hint": "Enter your full name" },
      "reason": "Added accessibility metadata (safe auto-fix)"
    }
    /* ... more auto-applied changes ... */
  ],
  "suggestions": [
    {
      "id": "val-user-name-1734123456001",
      "path": "properties.user.properties.name",
      "category": "validation",
      "rule": { "minLength": 1 },
      "description": "Add minimum length to prevent empty name",
      "applied": false,
      "impactedDimensions": ["validation"]
    },
    {
      "id": "val-user-email-1734123456002",
      "path": "properties.user.properties.email",
      "category": "validation",
      "rule": { "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
      "description": "Add email validation pattern for better data quality",
      "applied": false,
      "impactedDimensions": ["validation"]
    },
    {
      "id": "val-user-age-1734123456003",
      "path": "properties.user.properties.age",
      "category": "validation",
      "rule": { "minimum": 0, "maximum": 150 },
      "description": "Add realistic age constraints",
      "applied": false,
      "impactedDimensions": ["validation", "consistency"]
    }
  ],
  "qualityScore": 68,
  "qualityBreakdown": {
    "structure": 25, // Full score - schema is well-structured
    "validation": 0, // Low score - no validations yet (suggestions not applied)
    "accessibility": 20, // Full score - all fields have a11y metadata (auto-fixed)
    "consistency": 20, // Full score - no violations
    "improvement": 3 // 3/10 - only auto-fixes applied, 0/3 suggestions applied
  },
  "issues": [
    "properties.user.properties.name missing validation rules",
    "properties.user.properties.email missing validation rules",
    "properties.user.properties.age missing validation rules",
    "0 of 3 AI suggestions applied - consider reviewing suggestions"
  ],
  "model": "gpt-4",
  "tokensUsed": 1234,
  "metrics": {
    "totalChanges": 9,
    "totalSuggestions": 3,
    "appliedSuggestions": 0,
    "accessibilityCoverage": 1.0
  }
}
```

### Key Observations (Initial State)

1. **Safe Auto-Fixes Applied:**
   - Descriptions added ✅
   - Examples added ✅
   - x-accessibility added ✅
   - Email format added ✅

2. **Suggestions NOT Applied:**
   - minLength for name ❌ (suggested only)
   - Email pattern ❌ (suggested only)
   - Age constraints ❌ (suggested only)

3. **Quality Score: 68/100**
   - Validation: 0/25 (no validations in schema yet)
   - Improvement: 3/10 (only auto-fixes, no suggestions applied)

4. **Academic Justification:**
   - AI does NOT auto-apply validation rules (human decision required)
   - Quality score reflects ACTUAL schema state, not AI intentions
   - Deterministic scoring - reproducible and explainable

---

## Step 2: POST /schema/suggestion/apply (Apply First Suggestion)

### Request

```json
{
  "baseSchema": {
    /* enhanced schema from Step 1 */
  },
  "suggestion": {
    "id": "val-user-name-1734123456001",
    "path": "properties.user.properties.name",
    "category": "validation",
    "rule": { "minLength": 1 },
    "description": "Add minimum length to prevent empty name",
    "applied": false
  },
  "allSuggestions": [
    /* all 3 suggestions from Step 1 */
  ],
  "aiChanges": [
    /* changes from Step 1 */
  ],
  "action": "apply"
}
```

### Response

```json
{
  "schema": {
    "type": "object",
    "properties": {
      "user": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1, // ← NEW: Suggestion applied
            "description": "User's full name",
            "examples": ["John Doe"],
            "x-accessibility": { "label": "Name", "hint": "Enter your full name" }
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "User's email address",
            "examples": ["user@example.com"],
            "x-accessibility": { "label": "Email", "hint": "Enter your email address" }
          },
          "age": {
            "type": "number",
            "description": "User's age in years",
            "examples": [25],
            "x-accessibility": { "label": "Age", "hint": "Enter your age" }
          }
        }
      }
    }
  },
  "suggestion": {
    "id": "val-user-name-1734123456001",
    "path": "properties.user.properties.name",
    "category": "validation",
    "rule": { "minLength": 1 },
    "description": "Add minimum length to prevent empty name",
    "applied": true // ← Changed to true
  },
  "qualityScore": 76, // ← Increased from 68
  "qualityBreakdown": {
    "structure": 25,
    "validation": 8, // ← Increased from 0 (1/3 fields validated)
    "accessibility": 20,
    "consistency": 20,
    "improvement": 5 // ← Increased from 3 (1/3 suggestions applied)
  },
  "issues": [
    "properties.user.properties.email missing validation rules",
    "properties.user.properties.age missing validation rules",
    "1 of 3 AI suggestions applied"
  ],
  "scoreDelta": +8, // ← Quality improvement
  "action": "apply",
  "metrics": {
    "appliedSuggestions": 1,
    "totalSuggestions": 3
  }
}
```

### Key Changes (After Applying 1 Suggestion)

1. **Schema Updated:**
   - `name` field now has `minLength: 1` ✅

2. **Quality Score: 76/100 (+8)**
   - Validation: 8/25 (1 out of 3 fields now validated)
   - Improvement: 5/10 (1 out of 3 suggestions applied)

3. **Deterministic Behavior:**
   - No AI call made
   - Score recalculated based on CURRENT schema state
   - Operation is reversible (can undo)

---

## Step 3: Apply All Remaining Suggestions

After applying all 3 suggestions:

### Final Schema State

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1, // ← Applied
          "description": "User's full name",
          "examples": ["John Doe"],
          "x-accessibility": { "label": "Name", "hint": "Enter your full name" }
        },
        "email": {
          "type": "string",
          "format": "email",
          "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", // ← Applied
          "description": "User's email address",
          "examples": ["user@example.com"],
          "x-accessibility": { "label": "Email", "hint": "Enter your email address" }
        },
        "age": {
          "type": "number",
          "minimum": 0, // ← Applied
          "maximum": 150, // ← Applied
          "description": "User's age in years",
          "examples": [25],
          "x-accessibility": { "label": "Age", "hint": "Enter your age" }
        }
      }
    }
  }
}
```

### Final Quality Score

```json
{
  "qualityScore": 93,
  "qualityBreakdown": {
    "structure": 25, // Full score
    "validation": 25, // Full score - all fields validated
    "accessibility": 20, // Full score - all fields have a11y
    "consistency": 20, // Full score - no violations
    "improvement": 8 // 3 auto-fixes + 3/3 suggestions = 8/10
  },
  "issues": [], // No issues!
  "appliedSuggestionsCount": 3,
  "totalSuggestionsCount": 3
}
```

---

## Step 4: POST /schema/suggestion/apply (UNDO a Suggestion)

### Request (Undo Email Pattern)

```json
{
  "baseSchema": {
    /* original enhanced schema */
  },
  "suggestion": {
    "id": "val-user-email-1734123456002",
    "path": "properties.user.properties.email",
    "category": "validation",
    "rule": { "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
    "description": "Add email validation pattern for better data quality",
    "applied": true // ← Currently applied
  },
  "allSuggestions": [
    /* all suggestions with current applied states */
  ],
  "aiChanges": [
    /* original changes */
  ],
  "action": "undo"
}
```

### Response

```json
{
  "schema": {
    /* Schema with pattern REMOVED from email field */
    "properties": {
      "user": {
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            // "pattern": ... ← REMOVED
            "description": "User's email address"
          }
        }
      }
    }
  },
  "suggestion": {
    "id": "val-user-email-1734123456002",
    "applied": false // ← Changed to false
  },
  "qualityScore": 85, // ← Decreased from 93
  "qualityBreakdown": {
    "structure": 25,
    "validation": 17, // ← Decreased (1 field lost validation)
    "accessibility": 20,
    "consistency": 20,
    "improvement": 6 // ← Decreased (2/3 suggestions applied)
  },
  "scoreDelta": -8, // ← Quality degradation
  "action": "undo"
}
```

---

## Quality Scoring Formulas (Transparent & Deterministic)

### Dimension 1: Structure (25 points)

- Root is object: 5 pts
- Has properties: 5 pts
- Nested objects have properties: 10 pts (proportional)
- Arrays have items: 5 pts (proportional)

### Dimension 2: Validation (25 points)

**CRITICAL: Scored based on CURRENT schema only**

```
validatedFields / totalFields * 25

Example with 3 fields:
- 0 validated: 0/3 * 25 = 0 pts
- 1 validated: 1/3 * 25 = 8 pts
- 2 validated: 2/3 * 25 = 17 pts
- 3 validated: 3/3 * 25 = 25 pts
```

### Dimension 3: Accessibility (20 points)

- Fields with descriptions: 10 pts (proportional)
- Fields with x-accessibility.label: 10 pts (proportional)

### Dimension 4: Consistency (20 points)

- Penalty-based: 20 - (violations \* 2)
- Checks: required fields exist, no empty enums, pattern on strings only, min <= max

### Dimension 5: AI Improvement (10 points)

```
baseScore + suggestionScore

baseScore = min(autoChanges.length, 5)  // Up to 5 pts for auto-fixes
suggestionScore = (appliedSuggestions / totalSuggestions) * 5  // Up to 5 pts for suggestions

Example:
- 3 auto-changes, 0/3 suggestions: 3 + 0 = 3 pts
- 3 auto-changes, 1/3 suggestions: 3 + 1.67 = 4.67 pts
- 3 auto-changes, 3/3 suggestions: 3 + 5 = 8 pts
- 10 auto-changes, 3/3 suggestions: 5 + 5 = 10 pts
```

---

## Academic Justification

### 1. Human-in-the-Loop AI Design

**Principle:** AI suggests, humans decide

- ✅ AI generates suggestions but does NOT auto-apply validation rules
- ✅ User must explicitly approve each suggestion
- ✅ System is transparent about what is auto-fixed vs suggested

**Why This Matters:**

- Prevents AI from making unintended business logic changes
- User retains full control over schema constraints
- Aligns with responsible AI principles

### 2. Explainable Quality Metrics

**Principle:** Every score is traceable and deterministic

- ✅ Quality score is based on CURRENT schema state (not AI promises)
- ✅ Formula is documented and reproducible
- ✅ Each dimension has clear rules (no black-box scoring)

**Why This Matters:**

- Academic defensibility - results can be reproduced
- Users understand WHY score changed
- No AI self-evaluation (AI doesn't score itself)

### 3. Deterministic Scoring

**Principle:** Same input = same output, no randomness

- ✅ Apply/undo operations use deterministic path-based merging
- ✅ No AI calls during suggestion application
- ✅ Score recalculation is rule-based, not AI-based

**Why This Matters:**

- Reproducibility for academic evaluation
- Fast operations (no API latency)
- Predictable behavior

### 4. Safe AI Usage

**Principle:** AI constrained to safe operations

- ✅ AI cannot add/remove business fields
- ✅ AI cannot change enums or types
- ✅ AI cannot modify required arrays
- ✅ Invariants are validated and enforced

**Why This Matters:**

- Prevents schema corruption
- User trust in AI enhancements
- Production-ready safety

### 5. Separation of Concerns

**Principle:** Clear boundaries between components

```
┌──────────────────┐
│  OpenAILLMPlugin │ ← Transport layer (AI communication)
└────────┬─────────┘
         │
         │ Returns: enhancedSchema + changes + suggestions
         │
         ▼
┌──────────────────────┐
│ SchemaEnhancerService│ ← Domain logic (orchestration)
└────────┬─────────────┘
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌────────────────────┐   ┌─────────────────────┐
│ SuggestionEngine   │   │ QualityEngine       │
│ (apply/undo)       │   │ (scoring)           │
└────────────────────┘   └─────────────────────┘

Deterministic, no AI calls   Deterministic, rule-based
```

**Why This Matters:**

- Each component has one responsibility
- Easy to test and validate
- Portable across different LLM providers

---

## Summary

### What Changed

**Before:**

- AI auto-applied all improvements
- Quality score was heuristic-based
- No transparency into what AI changed

**After:**

- AI returns safe auto-fixes + suggestions separately
- User applies suggestions explicitly
- Quality score updates dynamically based on applied suggestions
- Full traceability and explainability

### Key Benefits

1. **Human Control:** User decides which validations to apply
2. **Transparency:** Clear separation between auto-fixes and suggestions
3. **Explainability:** Every quality score change is justified
4. **Determinism:** Same actions = same results
5. **Safety:** AI cannot break schema invariants
6. **Academic Rigor:** Reproducible, defensible, explainable

### API Endpoints

| Endpoint                           | Purpose               | AI Call?              |
| ---------------------------------- | --------------------- | --------------------- |
| `POST /schema/enhance`             | Initial enhancement   | ✅ Yes (once)         |
| `POST /schema/suggestion/apply`    | Apply/undo suggestion | ❌ No (deterministic) |
| `POST /schema/quality/recalculate` | Refresh quality score | ❌ No (deterministic) |

### Quality Score Journey

```
Original Schema:           0-40   (incomplete, no metadata)
After AI Enhancement:      68     (auto-fixes applied, no suggestions)
After 1 Suggestion:        76     (+8 pts)
After All Suggestions:     93     (+25 pts total)
```

This demonstrates:

- AI improvement is **measured by human decisions**, not AI output volume
- Score reflects **actual schema quality**, not theoretical potential
- System encourages **thoughtful engagement** with AI suggestions
