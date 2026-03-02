/**
 * Form Schema Converter
 * 
 * Shared utility to convert Form/Field/Group definitions to normalized JSON Schema
 * Used by JSON, YAML, and XML parsers for consistent output
 */

interface FieldDefinition {
  name: string;
  type: string;
  label?: string;
  required?: boolean | string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[] | OptionItem[];
  Options?: OptionItem[];
  Option?: string[];
}

interface OptionItem {
  value?: string;
  label?: string;
  _text?: string;
}

interface GroupDefinition {
  name: string;
  label?: string;
  repeatable?: boolean | string;
  Field?: FieldDefinition | FieldDefinition[];
}

interface FormDefinition {
  Title?: string;
  Field?: FieldDefinition | FieldDefinition[];
  Group?: GroupDefinition | GroupDefinition[];
}

/**
 * Check if parsed data represents a form definition (not already a JSON Schema)
 */
export function isFormDefinition(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check for Form structure
  if (data.Form) {
    const form = data.Form;
    return !!(form.Title || form.Field || form.Group);
  }
  
  // Check for direct form-like structure
  return !!(data.Title && (data.Field || data.Group)) && 
         !data.$schema && 
         !data.properties;
}

/**
 * Convert form definition to normalized JSON Schema
 */
export function convertFormToSchema(data: any): any {
  const formDef: FormDefinition = data.Form || data;
  
  const schema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    required: [],
  };
  
  // Add title if present
  if (formDef.Title) {
    schema.title = formDef.Title;
  }
  
  // Process fields
  if (formDef.Field) {
    const fields = Array.isArray(formDef.Field) ? formDef.Field : [formDef.Field];
    
    for (const field of fields) {
      if (!field.name) continue;
      
      schema.properties[field.name] = buildPropertyFromField(field);
      
      // Add to required array if field is required
      if (isFieldRequired(field)) {
        schema.required.push(field.name);
      }
    }
  }
  
  // Process groups
  if (formDef.Group) {
    const groups = Array.isArray(formDef.Group) ? formDef.Group : [formDef.Group];
    
    for (const group of groups) {
      if (!group.name) continue;
      
      const groupProp = buildGroupProperty(group);
      schema.properties[group.name] = groupProp.property;
      
      // Add group to required if it has required fields
      if (groupProp.isRequired) {
        schema.required.push(group.name);
      }
    }
  }
  
  // Clean up empty required array
  if (schema.required.length === 0) {
    delete schema.required;
  }
  
  return schema;
}

/**
 * Build a JSON Schema property from a field definition
 */
export function buildPropertyFromField(field: FieldDefinition): any {
  const property: any = mapFieldType(field.type);
  
  // Add title from label
  if (field.label) {
    property.title = field.label;
  }
  
  // Add constraints for strings
  if (property.type === 'string') {
    if (field.minLength !== undefined) {
      property.minLength = parseInt(String(field.minLength));
    }
    if (field.maxLength !== undefined) {
      property.maxLength = parseInt(String(field.maxLength));
    }
  }
  
  // Add constraints for numbers
  if (property.type === 'number' || property.type === 'integer') {
    if (field.min !== undefined) {
      property.minimum = Number(field.min);
    }
    if (field.max !== undefined) {
      property.maximum = Number(field.max);
    }
  }
  
  // Add enum if options present
  const options = extractOptions(field);
  if (options.length > 0) {
    property.enum = options;
  }
  
  return property;
}

/**
 * Build property from group definition (object or array)
 */
export function buildGroupProperty(group: GroupDefinition): { property: any; isRequired: boolean } {
  const isRepeatable = group.repeatable === true || group.repeatable === 'true';
  
  // Build the object schema for group fields
  const groupSchema: any = {
    type: 'object',
    properties: {},
    required: [],
  };
  
  // Process group fields
  if (group.Field) {
    const fields = Array.isArray(group.Field) ? group.Field : [group.Field];
    
    for (const field of fields) {
      if (!field.name) continue;
      
      groupSchema.properties[field.name] = buildPropertyFromField(field);
      
      if (isFieldRequired(field)) {
        groupSchema.required.push(field.name);
      }
    }
  }
  
  // Clean up empty required
  if (groupSchema.required.length === 0) {
    delete groupSchema.required;
  }
  
  // Determine if group itself is required (has required fields)
  const isRequired = groupSchema.required && groupSchema.required.length > 0;
  
  // Return as array if repeatable
  if (isRepeatable) {
    return {
      property: {
        type: 'array',
        items: groupSchema,
      },
      isRequired,
    };
  }
  
  return {
    property: groupSchema,
    isRequired,
  };
}

/**
 * Map form field type to JSON Schema type
 */
export function mapFieldType(fieldType: string): any {
  const type = (fieldType || '').toLowerCase();
  
  switch (type) {
    case 'text':
    case 'password':
      return { type: 'string' };
    
    case 'email':
      return { type: 'string', format: 'email' };
    
    case 'number':
      return { type: 'number' };
    
    case 'select':
      return { type: 'string' };
    
    case 'boolean':
      return { type: 'boolean' };
    
    default:
      return { type: 'string' };
  }
}

/**
 * Check if field is required
 */
function isFieldRequired(field: FieldDefinition): boolean {
  if (field.required === undefined) return false;
  if (field.required === true || field.required === 'true') return true;
  return false;
}

/**
 * Extract options array from field (handles different formats)
 */
function extractOptions(field: FieldDefinition): string[] {
  // Direct options array
  if (Array.isArray(field.options)) {
    return field.options.map(opt => {
      if (typeof opt === 'string') return opt;
      if (opt.value) return opt.value;
      if (opt._text) return opt._text;
      return String(opt);
    });
  }
  
  // XML-style Options with Option array
  if (field.Options && Array.isArray(field.Options)) {
    return field.Options.map(opt => {
      if (typeof opt === 'string') return opt;
      if (opt.value) return opt.value;
      if (opt._text) return opt._text;
      return String(opt);
    });
  }
  
  // XML-style Option array directly
  if (Array.isArray(field.Option)) {
    return field.Option;
  }
  
  return [];
}
