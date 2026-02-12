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
      allowBooleanAttributes: false,
      trimValues: true,
      ignoreDeclaration: true,
      parseTagValue: false, // CRITICAL: Don't parse "E1024" as null, keep as string
      isArray: (name) => {
        // Always treat these as arrays for consistent processing
        return ['Field', 'property', 'value', 'field', 'option', 'Option'].includes(name);
      },
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
      console.log('[XML Parser] Parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 1000));
      
      // Check if this is a JSON Schema definition in XML format
      const isSchemaXML = this.isSchemaXML(parsed);
      console.log('[XML Parser] Is schema XML?', isSchemaXML);
      console.log('[XML Parser] Has schema root?', !!parsed.schema);
      console.log('[XML Parser] Has type?', !!parsed.schema?.type);
      console.log('[XML Parser] Has properties?', !!parsed.schema?.properties);
      
      if (isSchemaXML) {
        const schema = this.parseSchemaXML(parsed);
        console.log('[XML Parser] Parsed as schema definition:', JSON.stringify(schema, null, 2).substring(0, 500));
        return {
          success: true,
          schema,
          detectedFormat: 'xml',
        };
      }
      
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
   * Check if XML represents a JSON Schema definition
   * Detects patterns like: <schema><type>object</type><properties>...
   */
  private isSchemaXML(data: any): boolean {
    // Check for <schema> root with <type> and <properties>
    if (data.schema && data.schema.type && data.schema.properties) {
      return true;
    }
    return false;
  }

  /**
   * Parse XML that represents a JSON Schema definition
   * Converts: <schema><properties><property name="x" type="string"/>...
   * To: { type: "object", properties: { x: { type: "string" } } }
   */
  private parseSchemaXML(data: any): any {
    const schemaRoot = data.schema;
    
    const result: any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
    };

    // Get type
    if (schemaRoot.type) {
      const typeValue = typeof schemaRoot.type === 'object' ? schemaRoot.type._text : schemaRoot.type;
      result.type = typeValue || 'object';
    }

    // Parse properties
    if (schemaRoot.properties) {
      result.properties = this.parsePropertiesXML(schemaRoot.properties);
    }

    // Parse required fields
    if (schemaRoot.required) {
      result.required = this.parseRequiredXML(schemaRoot.required);
    }

    return result;
  }

  /**
   * Parse <properties> containing <property> elements
   */
  private parsePropertiesXML(propertiesNode: any): Record<string, any> {
    const properties: Record<string, any> = {};

    // Get property elements (can be array or single object)
    const propertyElements = propertiesNode.property;
    if (!propertyElements) {
      return properties;
    }

    const propertyArray = Array.isArray(propertyElements) ? propertyElements : [propertyElements];

    for (const prop of propertyArray) {
      // Get property name from @_name attribute
      const propName = prop['@_name'];
      if (!propName) {
        console.warn('Property without name attribute, skipping');
        continue;
      }

      // Build property schema
      const propSchema: any = {};

      // Get type from attribute or nested element
      const typeAttr = prop['@_type'];
      const typeElement = prop.type;
      
      if (typeAttr) {
        propSchema.type = typeAttr;
      } else if (typeElement) {
        propSchema.type = typeof typeElement === 'object' ? typeElement._text : typeElement;
      }

      // Handle enum
      if (prop.enum) {
        const enumValues: string[] = [];
        const valueElements = prop.enum.value;
        
        if (valueElements) {
          const valueArray = Array.isArray(valueElements) ? valueElements : [valueElements];
          for (const val of valueArray) {
            const enumValue = typeof val === 'object' ? val._text : val;
            if (enumValue) {
              enumValues.push(enumValue);
            }
          }
        }
        
        if (enumValues.length > 0) {
          propSchema.enum = enumValues;
        }
      }

      // Handle nested object properties
      if (prop.properties) {
        propSchema.type = 'object';
        propSchema.properties = this.parsePropertiesXML(prop.properties);
      }

      properties[propName] = propSchema;
    }

    return properties;
  }

  /**
   * Parse <required> containing <field> elements
   */
  private parseRequiredXML(requiredNode: any): string[] {
    const required: string[] = [];

    const fieldElements = requiredNode.field;
    if (!fieldElements) {
      return required;
    }

    const fieldArray = Array.isArray(fieldElements) ? fieldElements : [fieldElements];

    for (const field of fieldArray) {
      const fieldName = typeof field === 'object' ? field._text : field;
      if (fieldName) {
        required.push(fieldName);
      }
    }

    return required;
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
   * Now handles Groups and Options
   */
  private parseFormXML(data: any): any {
    // Extract the form object
    const formData = data.Form || data.form || data;
    
    // Get title
    const titleValue = formData.Title || formData.title || formData['@_title'] || formData['@_name'];
    const title = typeof titleValue === 'object' ? titleValue._text || 'Untitled Form' : titleValue || 'Untitled Form';
    
    // Get fields
    const fields = formData.Field || formData.field || [];
    const fieldArray = Array.isArray(fields) ? fields : (fields ? [fields] : []);

    const properties: Record<string, any> = {};
    const required: string[] = [];

    // Process top-level fields
    fieldArray.forEach((field: any) => {
      const fieldName = field['@_name'];
      if (!fieldName) {
        console.warn('Field without name attribute found, skipping');
        return;
      }

      const fieldSchema = this.buildFieldSchema(field);
      properties[fieldName] = fieldSchema;
      
      if (field['@_required'] === 'true') {
        required.push(fieldName);
      }
    });

    // Process groups
    const groups = formData.Group || formData.group || [];
    const groupArray = Array.isArray(groups) ? groups : (groups ? [groups] : []);

    groupArray.forEach((group: any) => {
      const groupName = group['@_name'];
      if (!groupName) {
        console.warn('Group without name attribute found, skipping');
        return;
      }

      const isRepeatable = group['@_repeatable'] === 'true';
      const groupFields = group.Field || group.field || [];
      const groupFieldArray = Array.isArray(groupFields) ? groupFields : (groupFields ? [groupFields] : []);

      const groupProperties: Record<string, any> = {};
      const groupRequired: string[] = [];

      groupFieldArray.forEach((field: any) => {
        const fieldName = field['@_name'];
        if (!fieldName) return;

        const fieldSchema = this.buildFieldSchema(field);
        groupProperties[fieldName] = fieldSchema;
        
        if (field['@_required'] === 'true') {
          groupRequired.push(fieldName);
        }
      });

      // Create group schema
      const groupSchema: any = {
        type: 'object',
        properties: groupProperties,
      };

      if (groupRequired.length > 0) {
        groupSchema.required = groupRequired;
      }

      // Add label if present
      const groupLabel = group['@_label'] || group.Label || group.label;
      if (groupLabel) {
        groupSchema.title = typeof groupLabel === 'object' ? groupLabel._text : groupLabel;
      }

      // If repeatable, wrap in array
      if (isRepeatable) {
        properties[groupName] = {
          type: 'array',
          items: groupSchema,
        };
      } else {
        properties[groupName] = groupSchema;
      }

      // Add group to required if it has required fields
      if (groupRequired.length > 0) {
        required.push(groupName);
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
   * Build JSON Schema for a single field (with Options support)
   * NOTE: Does NOT add examples or x-accessibility (those come from AI Enhancement)
   */
  private buildFieldSchema(field: any): any {
    const fieldType = field['@_type'] || 'text';
    
    // Get label
    const labelValue = field.Label || field.label || field['_text'];
    const label = typeof labelValue === 'object' ? labelValue._text || field['@_name'] : labelValue || field['@_name'];

    // Build base schema
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

    // Helper to get field values
    const getFieldValue = (field: any, ...keys: string[]): any => {
      for (const key of keys) {
        const val = field[key];
        if (val !== undefined) {
          return typeof val === 'object' ? val._text : val;
        }
      }
      return undefined;
    };

    // Add validation constraints
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

    // Handle Options for select/enum fields
    const options = field.Options || field.options;
    if (options) {
      const optionItems = options.Option || options.option || [];
      const optionArray = Array.isArray(optionItems) ? optionItems : (optionItems ? [optionItems] : []);
      
      const enumValues = optionArray.map((opt: any) => {
        if (typeof opt === 'string') return opt;
        if (opt['@_value']) return opt['@_value'];
        if (opt._text) return opt._text;
        return String(opt);
      });

      if (enumValues.length > 0) {
        fieldSchema.enum = enumValues;
      }
    }

    return fieldSchema;
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
   * Generic data structure inference (fallback for non-form XML)
   * 
   * ENHANCED for Better Quality:
   * - Smart type detection (string vs integer vs number vs boolean)
   * - Meaningful titles from root element
   * - Validation rules (pattern, format, min/max)
   * - Does NOT add examples or x-accessibility (those come from AI Enhancement)
   */
  private inferSchemaFromData(data: any, isRoot: boolean = true, rootElementName?: string, fieldName?: string): any {
    const type = Array.isArray(data) ? 'array' : typeof data;

    if (type === 'object' && data !== null) {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      
      // Extract root element name for title generation
      let extractedRootName = rootElementName;
      if (isRoot && !extractedRootName) {
        const keys = Object.keys(data).filter(k => !k.startsWith('@_') && k !== '_text');
        if (keys.length > 0) {
          extractedRootName = keys[0];
        }
      }

      for (const [key, value] of Object.entries(data)) {
        // Skip XML parser metadata
        if (key.startsWith('@_') || key === '_text') {
          continue;
        }
        
        // Recursively infer schema for nested elements
        properties[key] = this.inferSchemaFromData(value, false, extractedRootName, key);
        required.push(key);
      }

      // Build object schema
      const schema: any = {
        type: 'object',
      };

      // Add properties only if there are any
      if (Object.keys(properties).length > 0) {
        schema.properties = properties;
      } else {
        schema.additionalProperties = true;
      }

      if (required.length > 0) {
        schema.required = required;
      }

      // Add $schema and title ONLY at root level
      if (isRoot) {
        console.log('[XML Parser] extractedRootName:', extractedRootName);
        const title = this.generateMeaningfulTitle(extractedRootName);
        console.log('[XML Parser] Generated title:', title);
        const description = extractedRootName ? `Schema for ${extractedRootName.replace(/([A-Z])/g, ' $1').trim()}` : 'Generated schema from XML data';
        
        // FLATTEN ROOT: If there's only one top-level property, flatten it
        const topLevelKeys = Object.keys(properties);
        console.log('[XML Parser] Top-level keys:', topLevelKeys);
        if (topLevelKeys.length === 1 && topLevelKeys[0] === extractedRootName) {
          console.log('[XML Parser] Flattening root element:', extractedRootName);
          // Extract nested properties from the root wrapper
          const rootElement = properties[extractedRootName];
          if (rootElement.type === 'object' && rootElement.properties) {
            return {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'object',
              title,
              description,
              properties: rootElement.properties,
              ...(rootElement.required && { required: rootElement.required }),
            };
          }
        }
        
        return {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          title,
          description,
          properties,
          ...(required.length > 0 && { required }),
        };
      }

      return schema;
    }

    if (type === 'array') {
      // Infer items schema from first element
      const items = data.length > 0 ? this.inferSchemaFromData(data[0], false, rootElementName, fieldName) : { type: 'string' };
      return {
        type: 'array',
        items,
      };
    }

    // Primitive types - ENHANCED TYPE DETECTION
    return this.inferPrimitiveType(data, fieldName || '');
  }

  /**
   * Smart type detection for primitive values
   * NOTE: Does NOT add examples or x-accessibility (those come from AI Enhancement)
   */
  private inferPrimitiveType(value: any, fieldName: string): any {
    const strValue = String(value).trim();
    const lowerFieldName = fieldName.toLowerCase();
    
    // Priority 1: Field name patterns for integers
    if (/^(age|count|quantity|numberof|years|level|rank)$/i.test(fieldName)) {
      const numValue = Number(strValue);
      if (!isNaN(numValue)) {
        const schema: any = {
          type: 'integer',
        };
        
        // Add age-specific constraints
        if (lowerFieldName === 'age') {
          schema.minimum = 0;
          schema.maximum = 150;
        } else {
          schema.minimum = 0;
        }
        
        return schema;
      }
    }
    
    // Priority 2: Boolean detection
    if (strValue === 'true' || strValue === 'false') {
      return {
        type: 'boolean',
      };
    }
    
    // Priority 3: ISO Date detection (YYYY-MM-DD pattern)
    if (/^\d{4}-\d{2}-\d{2}/.test(strValue)) {
      return {
        type: 'string',
        format: 'date',
      };
    }
    
    // Priority 4: Email detection
    if (/@.*\./.test(strValue)) {
      return {
        type: 'string',
        format: 'email',
      };
    }
    
    // Priority 5: Numeric detection
    const numValue = Number(strValue);
    if (!isNaN(numValue) && strValue !== '') {
      // Check if it's a pure integer (no letters, no decimals)
      if (/^-?\d+$/.test(strValue)) {
        // Could be integer, but check for ID patterns first
        if (/id$/i.test(fieldName) || /^(code|ref|number)/i.test(fieldName)) {
          // IDs with numbers only should still be strings for safety
          return {
            type: 'string',
            pattern: '^[A-Za-z0-9]+$',
          };
        }
        
        // Check field name for money/salary patterns
        if (/^(salary|price|amount|cost|fee|payment)$/i.test(fieldName)) {
          return {
            type: 'number',
            minimum: 0,
          };
        }
        
        // Pure integer
        return {
          type: 'integer',
        };
      }
      
      // Has decimal point - it's a number
      if (/^-?\d+\.\d+$/.test(strValue)) {
        const schema: any = {
          type: 'number',
          multipleOf: 0.01,
        };
        
        // Add minimum for money fields
        if (/^(salary|price|amount|cost|fee|payment)$/i.test(fieldName)) {
          schema.minimum = 0;
        }
        
        return schema;
      }
    }
    
    // Priority 6: Mixed alphanumeric (e.g., "E1024", "ABC123") - definitely string
    if (/[a-zA-Z]/.test(strValue) && /\d/.test(strValue)) {
      const schema: any = {
        type: 'string',
      };
      
      // Add pattern for ID fields
      if (/id$/i.test(fieldName)) {
        schema.pattern = '^[A-Za-z0-9]+$';
      }
      
      return schema;
    }
    
    // Default: string
    return {
      type: 'string',
    };
  }

  /**
   * Generate meaningful title from root element name
   * EmployeeRecord → "Employee Record Schema"
   */
  private generateMeaningfulTitle(rootElementName?: string): string {
    if (!rootElementName) {
      return 'Generated Schema';
    }
    
    // Convert camelCase/PascalCase to Title Case with spaces
    const titleCase = rootElementName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return `${titleCase} Schema`;
  }
}
