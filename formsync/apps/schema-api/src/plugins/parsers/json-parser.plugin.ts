/**
 * JSON Parser Plugin
 * 
 * Parses JSON input and converts to JSON Schema Draft-7
 * Handles both raw JSON data and existing JSON Schema
 * Now supports Form/Field/Group definitions → normalized user payload schema
 */

import { FormatParserPlugin, ParseResult } from '@formsync/plugins';
import { isFormDefinition, convertFormToSchema } from './form-schema-converter';

export class JsonParserPlugin implements FormatParserPlugin {
  readonly name = 'json-parser';

  canParse(input: string): boolean {
    try {
      const trimmed = input.trim();
      return (trimmed.startsWith('{') || trimmed.startsWith('[')) && JSON.parse(trimmed);
    } catch {
      return false;
    }
  }

  async parse(input: string): Promise<ParseResult> {
    try {
      const parsed = JSON.parse(input);
      
      // Check if it's a form definition first
      if (isFormDefinition(parsed)) {
        return {
          success: true,
          schema: convertFormToSchema(parsed),
          detectedFormat: 'json',
        };
      }
      
      // If already a JSON Schema, validate and return
      if (parsed.$schema || parsed.type || parsed.properties) {
        return {
          success: true,
          schema: this.normalizeToJsonSchema(parsed),
          detectedFormat: 'json',
        };
      }

      // Convert plain JSON object to JSON Schema
      const schema = this.inferSchemaFromData(parsed);
      
      return {
        success: true,
        schema,
        detectedFormat: 'json',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`JSON parsing failed: ${errorMessage}`],
        detectedFormat: 'json',
      };
    }
  }

  getSupportedFormats(): string[] {
    return ['json'];
  }

  private normalizeToJsonSchema(schema: any): any {
    // Deep clone the schema to avoid any reference issues
    const cloned = JSON.parse(JSON.stringify(schema));
    
    // Ensure it conforms to JSON Schema Draft-7
    if (!cloned.$schema) {
      cloned.$schema = 'http://json-schema.org/draft-07/schema#';
    }
    
    return cloned;
  }

  /**
   * Infer JSON Schema from data structure
   * This is a basic implementation - can be enhanced
   */
  private inferSchemaFromData(data: any): any {
    const type = Array.isArray(data) ? 'array' : typeof data;

    if (type === 'object' && data !== null) {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.inferSchemaFromData(value);
        required.push(key);
      }

      return {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties,
        required,
      };
    }

    if (type === 'array') {
      const items = data.length > 0 ? this.inferSchemaFromData(data[0]) : { type: 'string' };
      return {
        type: 'array',
        items,
      };
    }

    return { type: type === 'object' ? 'null' : type };
  }
}
