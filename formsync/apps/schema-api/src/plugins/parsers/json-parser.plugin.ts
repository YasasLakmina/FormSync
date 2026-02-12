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
   * Infer JSON Schema from data structure with smart type detection
   */
  private inferSchemaFromData(data: any, isRoot: boolean = true): any {
    const type = Array.isArray(data) ? 'array' : typeof data;

    if (type === 'object' && data !== null) {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        properties[key] = this.inferSchemaFromData(value, false);
        required.push(key);
      }

      const schema: any = {
        type: 'object',
        properties,
        ...(required.length > 0 && { required }),
      };

      // Add $schema, title and description only at root
      if (isRoot) {
        const title = this.generateTitleFromFields(Object.keys(properties));
        schema.$schema = 'http://json-schema.org/draft-07/schema#';
        schema.title = title;
        schema.description = `Schema for ${title.replace(' Schema', '')}`;
      }

      return schema;
    }

    if (type === 'array') {
      const items = data.length > 0 ? this.inferSchemaFromData(data[0], false) : { type: 'string' };
      return {
        type: 'array',
        items,
      };
    }

    // Smart type detection for primitives
    return this.inferPrimitiveType(data, '');
  }

  /**
   * Infer primitive type with smart detection
   */
  private inferPrimitiveType(value: any, fieldName: string): any {
    if (value === null || value === undefined) {
      return { type: 'string' };
    }

    const strValue = String(value).trim();

    // Boolean detection
    if (typeof value === 'boolean' || /^(true|false)$/i.test(strValue)) {
      return { type: 'boolean' };
    }

    // Date detection
    if (/^\d{4}-\d{2}-\d{2}/.test(strValue)) {
      return {
        type: 'string',
        format: 'date',
      };
    }

    // Email detection
    if (/@.*\./.test(strValue)) {
      return {
        type: 'string',
        format: 'email',
      };
    }

    // Numeric detection
    const numValue = Number(strValue);
    if (!isNaN(numValue) && strValue !== '') {
      // Integer
      if (/^-?\d+$/.test(strValue)) {
        return {
          type: 'integer',
          minimum: 0,
          maximum: 150,
        };
      }
      // Number
      return {
        type: 'number',
        minimum: 0,
      };
    }

    // Default: string
    return { type: 'string' };
  }

  /**
   * Generate meaningful title from field names
   */
  private generateTitleFromFields(fields: string[]): string {
    // Common patterns
    const patterns = [
      { keywords: ['user', 'username', 'password', 'email'], name: 'User' },
      { keywords: ['login', 'username', 'password'], name: 'Login' },
      { keywords: ['contact', 'phone', 'email', 'message'], name: 'Contact' },
      { keywords: ['address', 'street', 'city', 'zip'], name: 'Address' },
      { keywords: ['order', 'product', 'quantity', 'price'], name: 'Order' },
      { keywords: ['employee', 'salary', 'department'], name: 'Employee' },
    ];

    const lowerFields = fields.map(f => f.toLowerCase());
    
    for (const pattern of patterns) {
      const matchCount = pattern.keywords.filter(kw =>
        lowerFields.some(f => f.includes(kw))
      ).length;
      
      if (matchCount >= 1) {
        return `${pattern.name} Schema`;
      }
    }

    // Use first field as basis, stripping common suffixes
    if (fields.length > 0) {
      let fieldName = fields[0];
      // Strip common suffixes: Id, Name, Code, Number, Date, etc.
      fieldName = fieldName.replace(/(Id|Name|Code|Number|Date|Time|Status|Type)$/i, '');
      
      const formatted = fieldName
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return `${formatted} Schema`;
    }

    return 'Generated Schema';
  }
}
