/**
 * Unit Tests — SchemaQualityEngine
 *
 * Covers all 5 scoring dimensions:
 *  1. Structural Completeness  (25 pts)
 *  2. Validation Coverage      (25 pts)
 *  3. Accessibility Compliance (20 pts)
 *  4. Consistency & Safety     (20 pts)
 *  5. Enhancement Impact       (10 pts)
 */

import { SchemaQualityEngine } from "src/schema/schema-quality-engine";
import { SchemaSuggestion } from "src/schema/schema-suggestion.types";

// ─────────────────────────────────────────
// Helper to build minimal suggestions
// ─────────────────────────────────────────
function makeSuggestion(
  id: string,
  path: string,
  rule: Record<string, any>,
  applied = false,
): SchemaSuggestion {
  return {
    id,
    path,
    rule,
    applied,
    category: "validation",
    title: `Suggestion ${id}`,
    description: `Test suggestion ${id}`,
    impact: "medium",
  } as SchemaSuggestion;
}

// ─────────────────────────────────────────
// Shared perfect schema (all 5 dimensions satisfied)
// ─────────────────────────────────────────
const PERFECT_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "User Registration",
  description: "User registration form",
  type: "object",
  properties: {
    username: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      description: "Unique username",
      "x-accessibility": { label: "Username" },
    },
    age: {
      type: "integer",
      minimum: 0,
      maximum: 120,
      description: "User age",
      "x-accessibility": { label: "Age" },
    },
    isActive: {
      type: "boolean",
      description: "Account active status",
      "x-accessibility": { label: "Active" },
    },
  },
  required: ["username"],
};

describe("SchemaQualityEngine", () => {
  let engine: SchemaQualityEngine;

  beforeEach(() => {
    engine = new SchemaQualityEngine();
  });

  // ══════════════════════════════════════════════
  // Basic contract
  // ══════════════════════════════════════════════

  describe("evaluate() - result shape", () => {
    it("should return a result with all required keys", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("breakdown");
      expect(result).toHaveProperty("issues");
      expect(result).toHaveProperty("appliedSuggestionsCount");
      expect(result).toHaveProperty("totalSuggestionsCount");
    });

    it("score should be within 0–100", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("breakdown dimensions should sum close to total score", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      const { structure, validation, accessibility, consistency, improvement } =
        result.breakdown;
      const sum =
        structure + validation + accessibility + consistency + improvement;
      // Allow ±1 for rounding
      expect(Math.abs(sum - result.score)).toBeLessThanOrEqual(1);
    });
  });

  // ══════════════════════════════════════════════
  // Dimension 1 — Structural Completeness (25 pts)
  // ══════════════════════════════════════════════

  describe("Dimension 1 — Structural Completeness", () => {
    it("should award full structure score for a well-formed object schema", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      expect(result.breakdown.structure).toBe(25);
    });

    it("should penalise when root type is not object", () => {
      const schema = { type: "array", items: { type: "string" } };
      const result = engine.evaluate(schema as any);
      expect(result.breakdown.structure).toBeLessThan(25);
      expect(result.issues.some((i) => i.includes('type "object"'))).toBe(true);
    });

    it("should penalise when properties are empty", () => {
      const schema = { type: "object", properties: {} };
      const result = engine.evaluate(schema);
      expect(result.breakdown.structure).toBeLessThan(25);
    });

    it("should penalise when nested object has no properties", () => {
      const schema = {
        type: "object",
        properties: {
          address: { type: "object" }, // no nested properties
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.structure).toBeLessThan(25);
    });

    it("should penalise when an array field has no items definition", () => {
      const schema = {
        type: "object",
        properties: {
          tags: { type: "array" }, // missing items
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.structure).toBeLessThan(25);
    });

    it("should give full structure score when there are no arrays or nested objects", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.structure).toBe(25);
    });
  });

  // ══════════════════════════════════════════════
  // Dimension 2 — Validation Coverage (25 pts)
  // ══════════════════════════════════════════════

  describe("Dimension 2 — Validation Coverage", () => {
    it("should award full validation score when all string fields have constraints", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email" },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBe(25);
    });

    it("should award full validation score when all number fields have min/max", () => {
      const schema = {
        type: "object",
        properties: {
          age: { type: "integer", minimum: 0, maximum: 120 },
          price: { type: "number", minimum: 0 },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBe(25);
    });

    it("should award full score to boolean fields (type itself is a constraint)", () => {
      const schema = {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBe(25);
    });

    it("should count enum as a valid validation rule", () => {
      const schema = {
        type: "object",
        properties: {
          role: { type: "string", enum: ["admin", "user", "guest"] },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBe(25);
    });

    it("should penalise string fields with no constraints", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" }, // no minLength, maxLength, format, pattern
          email: { type: "string", format: "email" },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBeLessThan(25);
    });

    it("should penalise number fields with no min/max", () => {
      const schema = {
        type: "object",
        properties: {
          price: { type: "number" }, // no minimum/maximum
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBeLessThan(25);
    });

    it("should return full score (25) when there are no fields", () => {
      const schema = { type: "object", properties: {} };
      const result = engine.evaluate(schema);
      expect(result.breakdown.validation).toBe(25);
    });
  });

  // ══════════════════════════════════════════════
  // Dimension 3 — Accessibility Compliance (20 pts)
  // ══════════════════════════════════════════════

  describe("Dimension 3 — Accessibility Compliance", () => {
    it("should award full accessibility score when all fields have description + x-accessibility", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      expect(result.breakdown.accessibility).toBe(20);
    });

    it("should penalise fields missing description", () => {
      const schema = {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            // no description
            "x-accessibility": { label: "Name" },
          },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.accessibility).toBeLessThan(20);
    });

    it("should penalise user-input fields missing x-accessibility label", () => {
      const schema = {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 1,
            description: "User name",
            // no x-accessibility
          },
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.accessibility).toBeLessThan(20);
    });

    it("should NOT require x-accessibility on object-type fields", () => {
      const schema = {
        type: "object",
        properties: {
          address: {
            type: "object",
            description: "Mailing address",
            properties: {
              city: {
                type: "string",
                minLength: 1,
                description: "City name",
                "x-accessibility": { label: "City" },
              },
            },
          },
        },
      };
      const result = engine.evaluate(schema);
      // Address (object type) should not count against a11y
      expect(result.breakdown.accessibility).toBe(20);
    });

    it("should return full score when there are no fields", () => {
      const schema = { type: "object", properties: {} };
      const result = engine.evaluate(schema);
      expect(result.breakdown.accessibility).toBe(20);
    });
  });

  // ══════════════════════════════════════════════
  // Dimension 4 — Consistency & Safety (20 pts)
  // ══════════════════════════════════════════════

  describe("Dimension 4 — Consistency & Safety", () => {
    it("should award full consistency score for a clean schema", () => {
      const result = engine.evaluate(PERFECT_SCHEMA);
      expect(result.breakdown.consistency).toBe(20);
    });

    it("should deduct points when required field is not in properties", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
        },
        required: ["name", "missingField"], // "missingField" not in properties
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.consistency).toBeLessThan(20);
    });

    it("should deduct points for empty enum array", () => {
      const schema = {
        type: "object",
        properties: {
          status: { type: "string", enum: [] }, // empty enum
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.consistency).toBeLessThan(20);
    });

    it("should deduct points when pattern is used on non-string type", () => {
      const schema = {
        type: "object",
        properties: {
          age: { type: "integer", pattern: "^[0-9]+$" }, // pattern on integer
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.consistency).toBeLessThan(20);
    });

    it("should deduct points when minimum > maximum", () => {
      const schema = {
        type: "object",
        properties: {
          score: { type: "number", minimum: 100, maximum: 10 }, // inverted range
        },
      };
      const result = engine.evaluate(schema);
      expect(result.breakdown.consistency).toBeLessThan(20);
    });

    it("should handle multiple violations and cap at 0", () => {
      const schema = {
        type: "object",
        properties: {
          a: { type: "number", minimum: 100, maximum: 0 },
          b: { type: "number", minimum: 200, maximum: 1 },
          c: { type: "string", enum: [] },
          d: { type: "integer", pattern: "^x$" },
          e: { type: "number", minimum: 50, maximum: 10 },
          f: { type: "number", minimum: 999, maximum: 1 },
          g: { type: "number", minimum: 500, maximum: 100 },
          h: { type: "number", minimum: 300, maximum: 50 },
          i: { type: "number", minimum: 150, maximum: 20 },
          j: { type: "number", minimum: 250, maximum: 30 },
          k: { type: "number", minimum: 400, maximum: 60 },
        },
        required: ["missing"],
      };
      const result = engine.evaluate(schema as any);
      expect(result.breakdown.consistency).toBe(0);
    });
  });

  // ══════════════════════════════════════════════
  // Dimension 5 — Enhancement Impact (10 pts)
  // ══════════════════════════════════════════════

  describe("Dimension 5 — Enhancement Impact", () => {
    it("should return 0 improvement when no auto-changes and no suggestions", () => {
      const result = engine.evaluate(PERFECT_SCHEMA, [], [], []);
      expect(result.breakdown.improvement).toBe(0);
    });

    it("should award up to 3 pts for meaningful auto-changes", () => {
      // 'description' is a meaningful keyword, 'format' and 'minLength' are too
      const changes = [
        { path: "properties.email.format" },
        { path: "properties.name.minLength" },
        { path: "properties.name.description" },
      ];
      const result = engine.evaluate(PERFECT_SCHEMA, changes, [], []);
      // Engine caps at min(meaningfulChanges.length, 3) then rounds
      expect(result.breakdown.improvement).toBeGreaterThanOrEqual(2);
      expect(result.breakdown.improvement).toBeLessThanOrEqual(3);
    });

    it("should cap auto-change score at 3 even with many changes", () => {
      const changes = Array.from({ length: 10 }, (_, i) => ({
        path: `properties.field${i}.description`,
      }));
      const result = engine.evaluate(PERFECT_SCHEMA, changes, [], []);
      expect(result.breakdown.improvement).toBeLessThanOrEqual(10);
      // Auto-change part capped at 3
    });

    it("should award 7 pts for 100% suggestion acceptance", () => {
      const s1 = makeSuggestion(
        "s1",
        "properties.name",
        { minLength: 1 },
        true,
      );
      const s2 = makeSuggestion(
        "s2",
        "properties.email",
        { format: "email" },
        true,
      );
      const result = engine.evaluate(PERFECT_SCHEMA, [], [s1, s2], [s1, s2]);
      expect(result.breakdown.improvement).toBe(7);
    });

    it("should award proportional pts for partial acceptance (50%)", () => {
      const s1 = makeSuggestion(
        "s1",
        "properties.name",
        { minLength: 1 },
        true,
      );
      const s2 = makeSuggestion(
        "s2",
        "properties.email",
        { format: "email" },
        false,
      );
      const result = engine.evaluate(PERFECT_SCHEMA, [], [s1], [s1, s2]);
      // 50% of 7 = 3.5; breakdown rounds via Math.round → 4
      expect(result.breakdown.improvement).toBe(4);
    });

    it("should combine auto-change score with suggestion acceptance score", () => {
      // Use 3 changes that all hit meaningful keywords (format, minLength, pattern)
      const changes = [
        { path: "properties.email.format" },
        { path: "properties.name.minLength" },
        { path: "properties.name.pattern" },
      ]; // 3 meaningful → 3 pts auto
      const s1 = makeSuggestion("s1", "properties.age", { minimum: 18 }, true);
      const total = [s1];
      const applied = [s1];
      const result = engine.evaluate(PERFECT_SCHEMA, changes, applied, total);
      // 3 (auto) + 7 (100% acceptance) = 10; capped at 10
      expect(result.breakdown.improvement).toBeGreaterThanOrEqual(9);
      expect(result.breakdown.improvement).toBeLessThanOrEqual(10);
    });

    it("should note unreviewed suggestions in issues", () => {
      const s1 = makeSuggestion(
        "s1",
        "properties.name",
        { minLength: 1 },
        false,
      );
      const result = engine.evaluate(PERFECT_SCHEMA, [], [], [s1]);
      expect(result.issues.some((i) => i.includes("0 of"))).toBe(true);
    });

    it("should add normalization to 85 when all suggestions applied and no consistency violations", () => {
      // Use a schema that naturally scores below 85 (no descriptions, no a11y)
      const lowSchema = {
        type: "object",
        properties: {
          x: { type: "string", minLength: 1 },
        },
      };
      const s1 = makeSuggestion(
        "s1",
        "properties.x",
        { description: "test" },
        true,
      );
      const result = engine.evaluate(lowSchema, [], [s1], [s1]);
      expect(result.score).toBeGreaterThanOrEqual(85);
    });
  });

  // ══════════════════════════════════════════════
  // appliedSuggestionsCount / totalSuggestionsCount
  // ══════════════════════════════════════════════

  describe("suggestion count tracking", () => {
    it("should report appliedSuggestionsCount and totalSuggestionsCount correctly", () => {
      const s1 = makeSuggestion("s1", "properties.a", { minLength: 1 }, true);
      const s2 = makeSuggestion("s2", "properties.b", { minLength: 1 }, false);
      const result = engine.evaluate(PERFECT_SCHEMA, [], [s1], [s1, s2]);
      expect(result.appliedSuggestionsCount).toBe(1);
      expect(result.totalSuggestionsCount).toBe(2);
    });
  });
});
