/**
 * YAML Parser Plugin
 * 
 * Parses YAML input and converts to JSON Schema Draft-7
 * Uses js-yaml library for parsing
 * Now supports Form/Field/Group definitions → normalized user payload schema
 */

import { FormatParserPlugin, ParseResult } from '@formsync/plugins';
import * as yaml from 'js-yaml';
import { isFormDefinition, convertFormToSchema } from './form-schema-converter';

export class YamlParserPlugin implements FormatParserPlugin {
  readonly name = 'yaml-parser';

  canParse(input: string): boolean {
    try {
      const trimmed = input.trim();
      // YAML often starts with --- or contains key: value patterns
      if (trimmed.startsWith('---') || trimmed.includes(':\n') || trimmed.includes(': ')) {
        yaml.load(trimmed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async parse(input: string): Promise<ParseResult> {
    try {
      const parsed = yaml.load(input);
      
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          success: false,
          errors: ['YAML must parse to an object or array'],
          detectedFormat: 'yaml',
        };
      }

      // Check if it's a form definition first
      if (isFormDefinition(parsed)) {
        return {
          success: true,
          schema: convertFormToSchema(parsed),
          detectedFormat: 'yaml',
        };
      }

      // If already a JSON Schema, validate and return
      if ((parsed as any).$schema || (parsed as any).type || (parsed as any).properties) {
        return {
          success: true,
          schema: this.normalizeToJsonSchema(parsed),
          detectedFormat: 'yaml',
        };
      }

      // Convert plain YAML object to JSON Schema
      const schema = this.inferSchemaFromData(parsed);
      
      return {
        success: true,
        schema,
        detectedFormat: 'yaml',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`YAML parsing failed: ${errorMessage}`],
        detectedFormat: 'yaml',
      };
    }
  }

  getSupportedFormats(): string[] {
    return ['yaml', 'yml'];
  }

  private normalizeToJsonSchema(schema: any): any {
    // Deep clone to avoid reference issues
    const cloned = JSON.parse(JSON.stringify(schema));
    
    if (!cloned.$schema) {
      cloned.$schema = 'http://json-schema.org/draft-07/schema#';
    }
    
    return cloned;
  }

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
