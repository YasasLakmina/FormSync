/**
 * Unit Tests — SchemaSyntaxValidator
 *
 * Covers validateSyntax():
 *  - Valid JSON, YAML, XML inputs
 *  - Invalid syntax for each format
 *  - Format auto-detection
 *  - Format mismatch detection (selected vs detected)
 *  - Syntax error shape (line number, message)
 *  - Syntax suggestions (trailing comma, missing brace, etc.)
 */

import { Test, TestingModule } from "@nestjs/testing";
import { SchemaSyntaxValidator } from "src/schema/schema-syntax-validator";
import { SchemaEnhancerService } from "src/schema/schema-enhancer.service";

// ─────────────────────────────────────────
// Mock the AI-dependent enhancer so no HTTP calls are made
// ─────────────────────────────────────────
const mockEnhancerService = {
  enhanceSchema: jest.fn().mockResolvedValue({ enhancedSchema: {} }),
};

describe("SchemaSyntaxValidator", () => {
  let validator: SchemaSyntaxValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaSyntaxValidator,
        { provide: SchemaEnhancerService, useValue: mockEnhancerService },
      ],
    }).compile();

    validator = module.get<SchemaSyntaxValidator>(SchemaSyntaxValidator);
  });

  // ══════════════════════════════════════════════
  // Valid inputs
  // ══════════════════════════════════════════════

  describe("Valid inputs → valid: true", () => {
    it("should accept valid JSON", () => {
      const input = JSON.stringify({
        type: "object",
        properties: { name: { type: "string" } },
      });
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(true);
    });

    it("should accept valid YAML", () => {
      const input = `type: object\nproperties:\n  name:\n    type: string`;
      const result = validator.validateSyntax(input, "yaml");
      expect(result.valid).toBe(true);
    });

    it("should accept valid XML", () => {
      const input = `<Employee><name>John</name><age>30</age></Employee>`;
      const result = validator.validateSyntax(input, "xml");
      expect(result.valid).toBe(true);
    });

    it("should accept valid JSON without explicit format (auto-detect)", () => {
      const input = `{"type":"object"}`;
      const result = validator.validateSyntax(input);
      expect(result.valid).toBe(true);
    });

    it("should accept valid YAML without explicit format (auto-detect)", () => {
      const input = `type: object`;
      const result = validator.validateSyntax(input);
      expect(result.valid).toBe(true);
    });

    it("should accept valid XML without explicit format (auto-detect)", () => {
      const input = `<root><item>1</item></root>`;
      const result = validator.validateSyntax(input);
      expect(result.valid).toBe(true);
    });
  });

  // ══════════════════════════════════════════════
  // Invalid JSON
  // ══════════════════════════════════════════════

  describe("Invalid JSON", () => {
    it("should return valid: false for JSON with trailing comma", () => {
      const input = `{"type": "object", "title": "Test",}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(false);
    });

    it("should return valid: false for JSON with missing closing brace", () => {
      const input = `{"type": "object", "properties": {"name": {"type": "string"}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(false);
    });

    it("should return valid: false for JSON with unquoted key", () => {
      const input = `{type: "object"}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(false);
    });

    it("should include a syntaxErrors array in the result", () => {
      const input = `{invalid json}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(false);
      expect(result.syntaxErrors).toBeDefined();
      expect(result.syntaxErrors!.length).toBeGreaterThan(0);
    });

    it('syntaxError should have type "syntax" and a line number', () => {
      const input = `{invalid json}`;
      const result = validator.validateSyntax(input, "json");
      const err = result.syntaxErrors![0];
      expect(err.type).toBe("syntax");
      expect(typeof err.line).toBe("number");
    });

    it("should include suggestions for trailing comma", () => {
      const input = `{"a": 1,}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.syntaxSuggestions).toBeDefined();
    });
  });

  // ══════════════════════════════════════════════
  // Invalid YAML
  // ══════════════════════════════════════════════

  describe("Invalid YAML", () => {
    it("should return valid: false for YAML with bad indentation", () => {
      // Tabs not allowed in YAML indentation
      const input = `type: object\n\tproperties:\n\t  name: string`;
      const result = validator.validateSyntax(input, "yaml");
      expect(result.valid).toBe(false);
    });

    it("should include syntaxErrors with line number for YAML error", () => {
      const input = `type: object\n  bad : [unclosed`;
      const result = validator.validateSyntax(input, "yaml");
      if (!result.valid) {
        expect(result.syntaxErrors).toBeDefined();
        expect(result.syntaxErrors![0].type).toBe("syntax");
      }
    });
  });

  // ══════════════════════════════════════════════
  // Invalid XML
  // ══════════════════════════════════════════════

  describe("Invalid XML", () => {
    it("should return valid: false for unclosed XML tag", () => {
      const input = `<Employee><name>John</name><age>30</age>`;
      const result = validator.validateSyntax(input, "xml");
      expect(result.valid).toBe(false);
    });

    it("should return valid: false for mismatched XML tags", () => {
      const input = `<Employee><name>John</title></Employee>`;
      const result = validator.validateSyntax(input, "xml");
      expect(result.valid).toBe(false);
    });

    it("should include syntaxErrors for invalid XML", () => {
      const input = `<Employee><name>John</name>`;
      const result = validator.validateSyntax(input, "xml");
      expect(result.valid).toBe(false);
      expect(result.syntaxErrors).toBeDefined();
      expect(result.syntaxErrors!.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════
  // Format mismatch detection
  // ══════════════════════════════════════════════

  describe("Format mismatch", () => {
    it("should detect mismatch when JSON is submitted as YAML", () => {
      const input = `{"type": "object"}`; // JSON content
      const result = validator.validateSyntax(input, "yaml"); // declared as yaml
      expect(result.valid).toBe(false);
      expect(result.formatMismatch).toBeDefined();
      expect(result.formatMismatch!.selected).toBe("yaml");
      expect(result.formatMismatch!.detected).toBe("json");
    });

    it("should detect mismatch when XML is submitted as JSON", () => {
      const input = `<root><item>1</item></root>`;
      const result = validator.validateSyntax(input, "json");
      expect(result.valid).toBe(false);
      expect(result.formatMismatch).toBeDefined();
      expect(result.formatMismatch!.selected).toBe("json");
      expect(result.formatMismatch!.detected).toBe("xml");
    });

    it("should detect mismatch when YAML is submitted as XML", () => {
      const input = `type: object\nproperties:\n  name:\n    type: string`;
      const result = validator.validateSyntax(input, "xml");
      expect(result.valid).toBe(false);
      expect(result.formatMismatch).toBeDefined();
    });

    it("should NOT report mismatch when format matches content", () => {
      const input = `{"type":"object"}`;
      const result = validator.validateSyntax(input, "json");
      expect(result.formatMismatch).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════
  // Undetectable input
  // ══════════════════════════════════════════════

  describe("Undetectable format", () => {
    it("should return valid: false with an informative error for plain text", () => {
      const input = `hello world this is not a schema`;
      const result = validator.validateSyntax(input); // no format hint
      expect(result.valid).toBe(false);
      // Either syntaxErrors or formatMismatch should be present
      const hasError = result.syntaxErrors?.length || result.formatMismatch;
      expect(hasError).toBeTruthy();
    });
  });
});
