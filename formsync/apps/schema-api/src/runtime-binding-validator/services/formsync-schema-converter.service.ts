import { Injectable } from '@nestjs/common';
import { FormSyncSchema } from '../dto/formsync-schema.dto';

/**
 * FormSyncSchemaConverter
 * 
 * Converts FormSync JSON schema format to internal JSON Schema format
 * that the generator services can understand.
 */
@Injectable()
export class FormSyncSchemaConverter {
  /**
   * Convert FormSync schema to JSON Schema Draft-7 format
   */
  convertToJsonSchema(formSyncSchema: FormSyncSchema): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    // Process each field
    for (const field of formSyncSchema.fields) {
      properties[field.name] = this.buildFieldSchema(field);
      
      if (field.required) {
        required.push(field.name);
      }
    }

    // Build JSON Schema
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: formSyncSchema.form.name,
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      // Add FormSync metadata for use by generators
      'x-formsync': {
        form: formSyncSchema.form,
        backend: formSyncSchema.backend,
        frontend: formSyncSchema.frontend,
      },
    };

    return schema;
  }

  /**
   * Build JSON Schema for a single field
   */
  private buildFieldSchema(field: any): any {
    const fieldSchema: any = {
      type: this.mapFieldType(field.type),
    };

    // Add title from UI label
    if (field.ui?.label) {
      fieldSchema.title = field.ui.label;
    }

    // Add description from placeholder
    if (field.ui?.placeholder) {
      fieldSchema.description = field.ui.placeholder;
    }

    // Process validation rules
    if (field.validation) {
      const validation = field.validation;

      // String validations
      if (validation.email) {
        fieldSchema.format = 'email';
      }

      if (validation.minLength !== undefined) {
        fieldSchema.minLength = validation.minLength;
      }

      if (validation.maxLength !== undefined) {
        fieldSchema.maxLength = validation.maxLength;
      }

      if (validation.pattern) {
        fieldSchema.pattern = validation.pattern;
      }

      // Number validations
      if (validation.min !== undefined) {
        fieldSchema.minimum = validation.min;
      }

      if (validation.max !== undefined) {
        fieldSchema.maximum = validation.max;
      }
    }

    return fieldSchema;
  }

  /**
   * Map FormSync field type to JSON Schema type
   */
  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'integer',
      boolean: 'boolean',
      array: 'array',
      object: 'object',
    };

    return typeMap[type.toLowerCase()] || 'string';
  }

  /**
   * Extract backend configuration from FormSync schema
   */
  extractBackendConfig(formSyncSchema: FormSyncSchema): {
    packageName: string;
    projectName: string;
    controllerName?: string;
    dtoName?: string;
  } {
    return {
      packageName: formSyncSchema.backend.package || 'com.formsync.generated',
      projectName: formSyncSchema.form.name,
      controllerName: formSyncSchema.backend.controller?.name,
      dtoName: formSyncSchema.backend.dto?.name,
    };
  }
}
