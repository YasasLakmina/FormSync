/**
 * Schema Syntax Validator
 * 
 * Performs STRICT syntax validation before any other processing.
 * Detects format mismatches, provides line-level error reporting,
 * and generates syntax-only fix suggestions.
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import * as yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';

export interface SyntaxError {
  type: 'syntax';
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  syntaxErrors?: SyntaxError[];
  formatMismatch?: {
    selected: string;
    detected: string;
    message: string;
  };
  syntaxSuggestions?: Array<{
    location: string;
    fix: string;
    explanation: string;
  }>;
}

@Injectable()
export class SchemaSyntaxValidator {
  /**
   * Perform strict syntax validation based on format
   */
  validateSyntax(input: string, selectedFormat?: 'json' | 'yaml' | 'xml'): ValidationResult {
    // Step 1: Detect actual format
    const detectedFormat = this.detectFormat(input);
    
    // Step 2: Check for format mismatch
    if (selectedFormat && detectedFormat && selectedFormat !== detectedFormat) {
      return {
        valid: false,
        formatMismatch: {
          selected: selectedFormat,
          detected: detectedFormat,
          message: `Input format mismatch: Selected ${selectedFormat.toUpperCase()} but detected ${detectedFormat.toUpperCase()} content.`,
        },
      };
    }

    // Step 3: Perform syntax validation based on format
    const format = selectedFormat || detectedFormat;
    
    if (!format) {
      return {
        valid: false,
        syntaxErrors: [{
          type: 'syntax',
          line: 1,
          message: 'Could not detect input format. Please select JSON, YAML, or XML.',
        }],
      };
    }

    switch (format) {
      case 'json':
        return this.validateJSON(input);
      case 'yaml':
        return this.validateYAML(input);
      case 'xml':
        return this.validateXML(input);
      default:
        return {
          valid: false,
          syntaxErrors: [{
            type: 'syntax',
            line: 1,
            message: `Unsupported format: ${format}`,
          }],
        };
    }
  }

  /**
   * Detect format from input content
   */
  private detectFormat(input: string): 'json' | 'yaml' | 'xml' | null {
    const trimmed = input.trim();
    
    // Check JSON (starts with { or [)
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json';
    }
    
    // Check XML (starts with < or <?xml)
    if (trimmed.startsWith('<')) {
      return 'xml';
    }
    
    // Check YAML (has key: value patterns without braces, or starts with ---)
    if (trimmed.startsWith('---') || /^[a-zA-Z_][a-zA-Z0-9_]*:\s/.test(trimmed)) {
      return 'yaml';
    }
    
    return null;
  }

  /**
   * Validate JSON syntax
   */
  private validateJSON(input: string): ValidationResult {
    try {
      JSON.parse(input);
      return { valid: true };
    } catch (error) {
      const syntaxError = this.parseJSONError(error, input);
      const suggestions = this.generateJSONSuggestions(error, input);
      
      return {
        valid: false,
        syntaxErrors: [syntaxError],
        syntaxSuggestions: suggestions,
      };
    }
  }

  /**
   * Validate YAML syntax
   */
  private validateYAML(input: string): ValidationResult {
    try {
      yaml.load(input, { schema: yaml.JSON_SCHEMA });
      return { valid: true };
    } catch (error) {
      const syntaxError = this.parseYAMLError(error, input);
      const suggestions = this.generateYAMLSuggestions(error, input);
      
      return {
        valid: false,
        syntaxErrors: [syntaxError],
        syntaxSuggestions: suggestions,
      };
    }
  }

  /**
   * Validate XML syntax
   */
  private validateXML(input: string): ValidationResult {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseAttributeValue: true,
      });
      parser.parse(input);
      return { valid: true };
    } catch (error) {
      const syntaxError = this.parseXMLError(error, input);
      const suggestions = this.generateXMLSuggestions(error, input);
      
      return {
        valid: false,
        syntaxErrors: [syntaxError],
        syntaxSuggestions: suggestions,
      };
    }
  }

  /**
   * Parse JSON error to extract line/column information
   */
  private parseJSONError(error: any, input: string): SyntaxError {
    const message = error.message || 'Invalid JSON syntax';
    
    // Extract line number from error message (if available)
    const lineMatch = message.match(/position (\d+)/i) || message.match(/line (\d+)/i);
    let line = 1;
    let column: number | undefined;
    
    if (lineMatch) {
      const position = parseInt(lineMatch[1], 10);
      // Calculate line number from character position
      const beforeError = input.substring(0, position);
      line = (beforeError.match(/\n/g) || []).length + 1;
      const lastNewline = beforeError.lastIndexOf('\n');
      column = position - lastNewline;
    }
    
    return {
      type: 'syntax',
      line,
      column,
      message: `Syntax Error: ${message}`,
    };
  }

  /**
   * Parse YAML error to extract line/column information
   */
  private parseYAMLError(error: any, input: string): SyntaxError {
    const message = error.message || 'Invalid YAML syntax';
    
    // YAML errors often include line and column
    const line = error.mark?.line ? error.mark.line + 1 : 1;
    const column = error.mark?.column ? error.mark.column + 1 : undefined;
    
    return {
      type: 'syntax',
      line,
      column,
      message: `Syntax Error: ${message}`,
    };
  }

  /**
   * Parse XML error to extract line/column information
   */
  private parseXMLError(error: any, input: string): SyntaxError {
    const message = error.message || 'Invalid XML syntax';
    
    // Try to extract line number from error message
    const lineMatch = message.match(/line (\d+)/i);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;
    
    return {
      type: 'syntax',
      line,
      message: `Syntax Error: ${message}`,
    };
  }

  /**
   * Generate syntax-only suggestions for JSON errors
   */
  private generateJSONSuggestions(error: any, input: string): Array<{
    location: string;
    fix: string;
    explanation: string;
  }> {
    const suggestions: Array<{ location: string; fix: string; explanation: string }> = [];
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('unexpected end of json') || message.includes('unexpected end')) {
      // Count opening and closing braces
      const openBraces = (input.match(/{/g) || []).length;
      const closeBraces = (input.match(/}/g) || []).length;
      const openBrackets = (input.match(/\[/g) || []).length;
      const closeBrackets = (input.match(/]/g) || []).length;
      
      if (openBraces > closeBraces) {
        suggestions.push({
          location: 'End of file',
          fix: 'Add missing closing brace }',
          explanation: `Found ${openBraces} opening braces but only ${closeBraces} closing braces`,
        });
      }
      
      if (openBrackets > closeBrackets) {
        suggestions.push({
          location: 'End of file',
          fix: 'Add missing closing bracket ]',
          explanation: `Found ${openBrackets} opening brackets but only ${closeBrackets} closing brackets`,
        });
      }
    }
    
    if (message.includes('unexpected token') && message.includes(',')) {
      suggestions.push({
        location: 'Check trailing commas',
        fix: 'Remove trailing comma before } or ]',
        explanation: 'JSON does not allow trailing commas',
      });
    }
    
    if (message.includes('expected') && message.includes(':')) {
      suggestions.push({
        location: 'Check key-value pairs',
        fix: 'Ensure all object keys have values separated by colon (:)',
        explanation: 'Object properties must be in "key": "value" format',
      });
    }
    
    return suggestions;
  }

  /**
   * Generate syntax-only suggestions for YAML errors
   */
  private generateYAMLSuggestions(error: any, input: string): Array<{
    location: string;
    fix: string;
    explanation: string;
  }> {
    const suggestions: Array<{ location: string; fix: string; explanation: string }> = [];
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('indentation') || message.includes('indent')) {
      const line = error.mark?.line ? error.mark.line + 1 : 0;
      suggestions.push({
        location: `Line ${line}`,
        fix: 'Fix indentation using consistent spaces (2 or 4 spaces)',
        explanation: 'YAML requires consistent indentation. Do not mix tabs and spaces.',
      });
    }
    
    if (message.includes('mapping') || message.includes('key')) {
      suggestions.push({
        location: 'Check key-value format',
        fix: 'Ensure format is "key: value" with space after colon',
        explanation: 'YAML requires a space after the colon in key-value pairs',
      });
    }
    
    if (message.includes('duplicate')) {
      suggestions.push({
        location: 'Check for duplicate keys',
        fix: 'Remove or rename duplicate keys',
        explanation: 'YAML does not allow duplicate keys at the same level',
      });
    }
    
    return suggestions;
  }

  /**
   * Generate syntax-only suggestions for XML errors
   */
  private generateXMLSuggestions(error: any, input: string): Array<{
    location: string;
    fix: string;
    explanation: string;
  }> {
    const suggestions: Array<{ location: string; fix: string; explanation: string }> = [];
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('unclosed') || message.includes('closing tag')) {
      suggestions.push({
        location: 'Check XML tags',
        fix: 'Ensure all opening tags have matching closing tags',
        explanation: 'XML requires all tags to be properly closed',
      });
    }
    
    if (message.includes('malformed')) {
      suggestions.push({
        location: 'Check XML structure',
        fix: 'Verify tag syntax: <tagName>content</tagName>',
        explanation: 'XML tags must be properly formatted',
      });
    }
    
    if (message.includes('attribute')) {
      suggestions.push({
        location: 'Check attributes',
        fix: 'Ensure attributes are in format: attribute="value"',
        explanation: 'XML attributes must be quoted',
      });
    }
    
    return suggestions;
  }

  /**
   * Generate quick fixes for common syntax errors
   * ONLY fixes syntax - NEVER changes schema meaning
   */
  attemptQuickFix(input: string, selectedFormat: 'json' | 'yaml' | 'xml'): string | null {
    switch (selectedFormat) {
      case 'json':
        return this.quickFixJSON(input);
      case 'yaml':
        return this.quickFixYAML(input);
      case 'xml':
        return this.quickFixXML(input);
      default:
        return null;
    }
  }

  /**
   * Quick fix for JSON (minimal corrections only)
   */
  private quickFixJSON(input: string): string | null {
    let fixed = input;
    
    // Fix trailing commas (safe fix)
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Try to fix missing closing braces (only if clear)
    const openBraces = (fixed.match(/{/g) || []).length;
    const closeBraces = (fixed.match(/}/g) || []).length;
    
    if (openBraces === closeBraces + 1 && !fixed.trim().endsWith('}')) {
      fixed = fixed.trim() + '\n}';
    }
    
    // Verify the fix worked
    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      return null; // Don't return invalid fixes
    }
  }

  /**
   * Quick fix for YAML (minimal corrections only)
   */
  private quickFixYAML(input: string): string | null {
    // YAML fixes are complex and error-prone
    // Only attempt very safe fixes
    let fixed = input;
    
    // Fix missing space after colon (safe fix)
    fixed = fixed.replace(/([a-zA-Z0-9_]+):([^\s])/g, '$1: $2');
    
    // Verify the fix worked
    try {
      yaml.load(fixed, { schema: yaml.JSON_SCHEMA });
      return fixed;
    } catch {
      return null;
    }
  }

  /**
   * Quick fix for XML (minimal corrections only)
   */
  private quickFixXML(input: string): string | null {
    // XML fixes are complex
    // Return null for now - XML self-closing tags and structure are hard to auto-fix
    return null;
  }
}
