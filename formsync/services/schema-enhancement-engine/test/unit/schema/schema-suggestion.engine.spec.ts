/**
 * Unit Tests — SchemaSuggestionEngine
 *
 * Covers:
 *  - applySuggestion()          (add properties to a field)
 *  - undoSuggestion()           (remove those properties)
 *  - applyMultipleSuggestions() (batch apply using applied flag)
 *  - getCurrentSchemaState()    (base + applied)
 *  - validateSuggestion()       (guards on suggestion shape)
 *  - Smart merge (preserve existing user values)
 *  - Invalid path handling
 */

import { SchemaSuggestionEngine } from "src/schema/schema-suggestion.engine";
import { SchemaSuggestion } from "src/schema/schema-suggestion.types";

// ─────────────────────────────────────────
// Helper builders
// ─────────────────────────────────────────
function makeSuggestion(
  overrides: Partial<SchemaSuggestion> = {},
): SchemaSuggestion {
  return {
    id: "test-id-001",
    path: "properties.username",
    rule: { minLength: 3 },
    applied: false,
    category: "validation",
    title: "Test suggestion",
    description: "Add minLength constraint",
    impact: "medium",
    ...overrides,
  } as SchemaSuggestion;
}

const BASE_SCHEMA = {
  type: "object",
  properties: {
    username: { type: "string" },
    age: { type: "integer" },
    address: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
    },
  },
};

describe("SchemaSuggestionEngine", () => {
  let engine: SchemaSuggestionEngine;

  beforeEach(() => {
    engine = new SchemaSuggestionEngine();
  });

  // ══════════════════════════════════════════════
  // applySuggestion
  // ══════════════════════════════════════════════

  describe("applySuggestion()", () => {
    it("should add a new property to the target field", () => {
      const suggestion = makeSuggestion({ rule: { minLength: 5 } });
      const result = engine.applySuggestion(BASE_SCHEMA, suggestion);
      expect(result.properties.username.minLength).toBe(5);
    });

    it("should not mutate the original schema", () => {
      const suggestion = makeSuggestion({ rule: { minLength: 5 } });
      engine.applySuggestion(BASE_SCHEMA, suggestion);
      expect(
        (BASE_SCHEMA.properties.username as any).minLength,
      ).toBeUndefined();
    });

    it("should apply a suggestion to a nested path", () => {
      const suggestion = makeSuggestion({
        path: "properties.address.properties.city",
        rule: { minLength: 2 },
      });
      const result = engine.applySuggestion(BASE_SCHEMA, suggestion);
      expect(result.properties.address.properties.city.minLength).toBe(2);
    });

    it("should apply multiple keys from rule at once", () => {
      const suggestion = makeSuggestion({
        rule: { minLength: 3, maxLength: 20, description: "Unique username" },
      });
      const result = engine.applySuggestion(BASE_SCHEMA, suggestion);
      const field = result.properties.username;
      expect(field.minLength).toBe(3);
      expect(field.maxLength).toBe(20);
      expect(field.description).toBe("Unique username");
    });

    it("should NOT overwrite an existing user-defined value", () => {
      const existingSchema = {
        type: "object",
        properties: {
          username: { type: "string", minLength: 10 }, // user already set minLength
        },
      };
      const suggestion = makeSuggestion({ rule: { minLength: 3 } }); // AI suggests 3
      const result = engine.applySuggestion(existingSchema, suggestion);
      // User value (10) should be preserved
      expect(result.properties.username.minLength).toBe(10);
    });

    it("should merge examples arrays without duplicates", () => {
      const existingSchema = {
        type: "object",
        properties: {
          username: { type: "string", examples: ["alice"] },
        },
      };
      const suggestion = makeSuggestion({
        rule: { examples: ["alice", "bob"] }, // 'alice' already exists
      });
      const result = engine.applySuggestion(existingSchema, suggestion);
      expect(result.properties.username.examples).toEqual(["alice", "bob"]);
    });

    it("should throw an error when path is invalid", () => {
      const suggestion = makeSuggestion({ path: "properties.nonExistent" });
      expect(() => engine.applySuggestion(BASE_SCHEMA, suggestion)).toThrow(
        /Invalid path/,
      );
    });
  });

  // ══════════════════════════════════════════════
  // undoSuggestion
  // ══════════════════════════════════════════════

  describe("undoSuggestion()", () => {
    it("should remove the keys added by a suggestion", () => {
      // First apply
      const suggestion = makeSuggestion({ rule: { minLength: 5 } });
      const applied = engine.applySuggestion(BASE_SCHEMA, suggestion);
      expect(applied.properties.username.minLength).toBe(5);

      // Then undo
      const undone = engine.undoSuggestion(applied, suggestion);
      expect(undone.properties.username.minLength).toBeUndefined();
    });

    it("should not remove other properties while undoing", () => {
      const suggestion = makeSuggestion({
        rule: { minLength: 5, description: "test" },
      });
      const applied = engine.applySuggestion(BASE_SCHEMA, suggestion);

      // Only undo minLength
      const partialSuggestion = makeSuggestion({ rule: { minLength: 5 } });
      const undone = engine.undoSuggestion(applied, partialSuggestion);

      expect(undone.properties.username.minLength).toBeUndefined();
      expect(undone.properties.username.description).toBe("test"); // preserved
    });

    it("should not mutate the original schema", () => {
      const suggestion = makeSuggestion({ rule: { minLength: 5 } });
      const applied = engine.applySuggestion(BASE_SCHEMA, suggestion);
      engine.undoSuggestion(applied, suggestion);
      expect(applied.properties.username.minLength).toBe(5); // still present in applied
    });

    it("should return schema unchanged when path does not exist", () => {
      const suggestion = makeSuggestion({
        path: "properties.ghost",
        rule: { minLength: 5 },
      });
      const result = engine.undoSuggestion(BASE_SCHEMA, suggestion);
      expect(result).toEqual(BASE_SCHEMA);
    });

    it("should handle undo on a nested path", () => {
      const suggestion = makeSuggestion({
        path: "properties.address.properties.city",
        rule: { minLength: 2 },
      });
      const applied = engine.applySuggestion(BASE_SCHEMA, suggestion);
      const undone = engine.undoSuggestion(applied, suggestion);
      expect(
        undone.properties.address.properties.city.minLength,
      ).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════
  // applyMultipleSuggestions
  // ══════════════════════════════════════════════

  describe("applyMultipleSuggestions()", () => {
    it("should apply only suggestions marked applied: true", () => {
      const s1 = makeSuggestion({
        id: "s1",
        rule: { minLength: 3 },
        applied: true,
      });
      const s2 = makeSuggestion({
        id: "s2",
        path: "properties.age",
        rule: { minimum: 18 },
        applied: false,
      });

      const result = engine.applyMultipleSuggestions(BASE_SCHEMA, [s1, s2]);

      expect(result.properties.username.minLength).toBe(3); // applied
      expect(result.properties.age.minimum).toBeUndefined(); // not applied
    });

    it("should apply multiple true suggestions in sequence", () => {
      const s1 = makeSuggestion({
        id: "s1",
        rule: { minLength: 3 },
        applied: true,
      });
      const s2 = makeSuggestion({
        id: "s2",
        path: "properties.age",
        rule: { minimum: 18 },
        applied: true,
      });

      const result = engine.applyMultipleSuggestions(BASE_SCHEMA, [s1, s2]);

      expect(result.properties.username.minLength).toBe(3);
      expect(result.properties.age.minimum).toBe(18);
    });

    it("should return the original schema when no suggestions are applied", () => {
      const s1 = makeSuggestion({
        id: "s1",
        rule: { minLength: 3 },
        applied: false,
      });
      const result = engine.applyMultipleSuggestions(BASE_SCHEMA, [s1]);
      expect(result.properties.username.minLength).toBeUndefined();
    });

    it("should return unchanged schema when suggestions array is empty", () => {
      const result = engine.applyMultipleSuggestions(BASE_SCHEMA, []);
      expect(result).toEqual(BASE_SCHEMA);
    });
  });

  // ══════════════════════════════════════════════
  // getCurrentSchemaState
  // ══════════════════════════════════════════════

  describe("getCurrentSchemaState()", () => {
    it("should reflect only the applied suggestions in the returned schema", () => {
      const s1 = makeSuggestion({
        id: "s1",
        rule: { minLength: 3 },
        applied: true,
      });
      const s2 = makeSuggestion({
        id: "s2",
        path: "properties.age",
        rule: { minimum: 18 },
        applied: false,
      });

      const state = engine.getCurrentSchemaState(BASE_SCHEMA, [s1, s2]);

      expect(state.properties.username.minLength).toBe(3);
      expect(state.properties.age.minimum).toBeUndefined();
    });

    it("should return base schema unchanged when no suggestions are applied", () => {
      const s1 = makeSuggestion({ applied: false });
      const state = engine.getCurrentSchemaState(BASE_SCHEMA, [s1]);
      expect(state.properties.username.minLength).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════
  // validateSuggestion
  // ══════════════════════════════════════════════

  describe("validateSuggestion()", () => {
    it("should return true for a valid suggestion", () => {
      const suggestion = makeSuggestion();
      expect(engine.validateSuggestion(suggestion)).toBe(true);
    });

    it("should throw when id is missing", () => {
      const suggestion = makeSuggestion({ id: "" });
      expect(() => engine.validateSuggestion(suggestion)).toThrow();
    });
  });

  // ══════════════════════════════════════════════
  // Round-trip: apply then undo restores original
  // ══════════════════════════════════════════════

  describe("apply → undo round-trip", () => {
    it("should restore schema to original after apply then undo", () => {
      const suggestion = makeSuggestion({
        rule: { minLength: 5, description: "test desc" },
      });

      const applied = engine.applySuggestion(BASE_SCHEMA, suggestion);
      const restored = engine.undoSuggestion(applied, suggestion);

      expect(restored.properties.username).toEqual(
        BASE_SCHEMA.properties.username,
      );
    });
  });
});
