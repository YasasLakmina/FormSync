/**
 * XML Parser Plugin - Enhanced Version
 * 
 * Parses XML input and converts to JSON Schema Draft-7
 * Features:
 * - Form-aware parsing (detects <Form>, <Field> patterns)
 * - Preserves field names and attributes
 * - Maps validation rules to JSON Schema constraints
 * - Handles type inference from XML attributes
 */

import { FormatParserPlugin, ParseResult } from '@formsync/plugins';
import { XMLParser } from 'fast-xml-parser';

export class XmlParserPlugin implements FormatParserPlugin {
  readonly name = 'xml-parser';
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '_text',
      isArray: (name) => name === 'Field', // Always treat Field as array
    });
  }

  canParse(input: string): boolean {
    try {
      const trimmed = input.trim();
      return trimmed.startsWith('<') && trimmed.includes('>');
    } catch {
      return false;
    }
  }

  async parse(input: string): Promise<ParseResult> {
    try {
      const parsed = this.parser.parse(input);
      
      if (!parsed || typeof parsed !== 'object') {
        return {
          success: false,
          errors: ['XML must contain valid data structure'],
          detectedFormat: 'xml',
        };
      }

      // Debug logging
      console.log('[XML Parser] Parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 500));
      
      // Check if this is a form definition
      const isForm = this.isFormXML(parsed);
      console.log('[XML Parser] Is form XML?', isForm);
      
      const schema = isForm 
        ? this.parseFormXML(parsed)
        : this.inferSchemaFromData(parsed);
      
      console.log('[XML Parser] Generated schema type:', schema.title || 'generic');
      
      return {
        success: true,
        schema,
        detectedFormat: 'xml',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`XML parsing failed: ${errorMessage}`],
        detectedFormat: 'xml',
      };
    }
  }

  getSupportedFormats(): string[] {
    return ['xml'];
  }

  /**
   * Check if XML represents a form definition
   */
  private isFormXML(data: any): boolean {
    // Check for Form/form root element
    if (data.Form || data.form) {
      return true;
    }
    
    // Check for Field array at root
    if (data.Field && Array.isArray(data.Field)) {
      return true;
    }
    
    // Check if any child has Field array
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key].Field) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Parse form-like XML structures
   */
  private parseFormXML(data: any): any {
    // Extract the form object
    const formData = data.Form || data.form || data;
    
    // Get title
    const titleValue = formData.Title || formData.title || formData['@_title'] || formData['@_name'];
    const title = typeof titleValue === 'object' ? titleValue._text || 'Untitled Form' : titleValue || 'Untitled Form';
    
    // Get fields
    const fields = formData.Field || formData.field || [];
    const fieldArray = Array.isArray(fields) ? fields : [fields];

    const properties: Record<string, any> = {};
    const required: string[] = [];

    fieldArray.forEach((field: any) => {
      const fieldName = field['@_name'];
      if (!fieldName) {
        console.warn('Field without name attribute found, skipping');
        return;
      }

      const fieldType = field['@_type'] || 'text';
      const isRequired = field['@_required'] === 'true';
      
      // Get label - could be element or text
      const labelValue = field.Label || field.label || field['_text'];
      const label = typeof labelValue === 'object' ? labelValue._text || fieldName : labelValue || fieldName;

      // Build JSON Schema for this field
      const fieldSchema: any = {
        type: this.mapXMLTypeToJSONSchemaType(fieldType),
        title: label,
      };

      // Add format for special types
      if (fieldType === 'email') {
        fieldSchema.format = 'email';
      } else if (fieldType === 'url') {
        fieldSchema.format = 'uri';
      } else if (fieldType === 'date') {
        fieldSchema.format = 'date';
      }

      // Add validation constraints - handle both element and text content
      const getFieldValue = (field: any, ...keys: string[]): any => {
        for (const key of keys) {
          const val = field[key];
          if (val !== undefined) {
            return typeof val === 'object' ? val._text : val;
          }
        }
        return undefined;
      };

      const minLength = getFieldValue(field, 'MinLength', 'minLength');
      if (minLength !== undefined) {
        fieldSchema.minLength = parseInt(minLength);
      }

      const maxLength = getFieldValue(field, 'MaxLength', 'maxLength');
      if (maxLength !== undefined) {
        fieldSchema.maxLength = parseInt(maxLength);
      }

      const min = getFieldValue(field, 'Min', 'min', 'minimum');
      if (min !== undefined) {
        fieldSchema.minimum = parseFloat(min);
      }

      const max = getFieldValue(field, 'Max', 'max', 'maximum');
      if (max !== undefined) {
        fieldSchema.maximum = parseFloat(max);
      }

      const pattern = getFieldValue(field, 'Pattern', 'pattern');
      if (pattern !== undefined) {
        fieldSchema.pattern = pattern;
      }

      // Add description if present
      const description = getFieldValue(field, 'Description', 'description');
      if (description) {
        fieldSchema.description = description;
      }

      // Add placeholder as example
      const placeholder = getFieldValue(field, 'Placeholder', 'placeholder');
      if (placeholder) {
        fieldSchema.examples = [placeholder];
      }

      properties[fieldName] = fieldSchema;
      
      if (isRequired) {
        required.push(fieldName);
      }
    });

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: title,
      description: `Form schema for ${title}`,
      properties,
      ...(required.length > 0 && { required }),
    };
  }

  /**
   * Map XML input types to JSON Schema types
   */
  private mapXMLTypeToJSONSchemaType(xmlType: string): string {
    const typeMap: Record<string, string> = {
      'text': 'string',
      'email': 'string',
      'password': 'string',
      'url': 'string',
      'tel': 'string',
      'number': 'number',
      'integer': 'integer',
      'float': 'number',
      'boolean': 'boolean',
      'checkbox': 'boolean',
      'date': 'string',
      'datetime': 'string',
      'time': 'string',
      'textarea': 'string',
      'select': 'string',
      'radio': 'string',
    };

    return typeMap[xmlType.toLowerCase()] || 'string';
  }

  /**
   * Generic data structure inference (fallback)
   */
  private inferSchemaFromData(data: any): any {
    const type = Array.isArray(data) ? 'array' : typeof data;

    if (type === 'object' && data !== null) {
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(data)) {
        // Skip XML parser metadata
        if (key.startsWith('@_') || key === '_text') {
          continue;
        }
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
