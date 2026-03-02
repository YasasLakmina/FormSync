/**
 * Ajv JSON Schema Validator Plugin
 * 
 * Validates JSON Schemas using Ajv (Another JSON Schema Validator)
 * Checks compliance with JSON Schema Draft-7 specification
 */

import { SchemaValidatorPlugin, ValidationResult, ValidationIssue } from '../../types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export class AjvValidatorPlugin implements SchemaValidatorPlugin {
  readonly name = 'ajv-validator';
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    // Cast required: ajv-formats may resolve a different ajv copy via hoisting
    addFormats(this.ajv as any);
  }

  async validate(schema: any): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    try {
      // Try to compile the schema
      this.ajv.compile(schema);

      // Additional checks
      this.checkSchemaVersion(schema, issues);
      this.checkRequiredFields(schema, issues);
      this.checkTypes(schema, issues);

      return {
        success: issues.filter((i) => i.severity === 'error').length === 0,
        issues,
        validatorName: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      // Ajv compilation errors
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray(error.errors)) {
        for (const err of error.errors) {
          issues.push({
            id: `ajv-${err.keyword}`,
            path: err.instancePath || err.schemaPath || 'root',
            severity: 'error',
            message: err.message || 'Unknown validation error',
          });
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        issues.push({
          id: 'ajv-compile-error',
          path: 'root',
          severity: 'error',
          message: errorMessage,
        });
      }

      return {
        success: false,
        issues,
        validatorName: this.name,
        timestamp: new Date(),
      };
    }
  }

  getValidatorName(): string {
    return 'Ajv JSON Schema Validator';
  }

  getDescription(): string {
    return 'Validates JSON Schema compliance with Draft-7 specification';
  }

  private checkSchemaVersion(schema: any, issues: ValidationIssue[]): void {
    if (!schema.$schema) {
      issues.push({
        id: 'missing-schema-version',
        path: '$schema',
        severity: 'warning',
        message: 'Missing $schema property',
        suggestion: 'Add "$schema": "http://json-schema.org/draft-07/schema#"',
      });
    }
  }

  private checkRequiredFields(schema: any, issues: ValidationIssue[]): void {
    if (schema.type === 'object' && schema.properties) {
      if (!schema.required || schema.required.length === 0) {
        issues.push({
          id: 'no-required-fields',
          path: 'required',
          severity: 'info',
          message: 'No required fields specified',
          suggestion: 'Consider adding required fields array',
        });
      }
    }
  }

  private checkTypes(schema: any, issues: ValidationIssue[]): void {
    if (!schema.type) {
      issues.push({
        id: 'missing-type',
        path: 'type',
        severity: 'warning',
        message: 'Missing type definition',
        suggestion: 'Specify a type (object, array, string, etc.)',
      });
    }
  }
}
