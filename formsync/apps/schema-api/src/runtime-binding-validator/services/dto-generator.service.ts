import { Injectable } from '@nestjs/common';

/**
 * DtoGeneratorService
 * 
 * Generates Java DTO (Data Transfer Object) classes from JSON Schema.
 * Maps JSON Schema types and constraints to Java types and validation annotations.
 */
@Injectable()
export class DtoGeneratorService {
  /**
   * Generate a Java DTO class from JSON Schema
   */
  generateDto(schema: any, className: string, packageName: string): string {
    const properties = schema.properties || {};
    const required = schema.required || [];
    
    const fields = this.generateFields(properties, required);
    const imports = this.generateImports(properties, required);
    
    return `package ${packageName}.dto;

${imports}

/**
 * ${className} DTO
 * Generated from schema: ${schema.title || 'Unknown'}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ${className}Dto {

${fields}
}
`;
  }

  /**
   * Generate import statements based on validation requirements
   */
  private generateImports(properties: any, required: string[]): string {
    const imports = new Set<string>([
      'import lombok.Data;',
      'import lombok.Builder;',
      'import lombok.NoArgsConstructor;',
      'import lombok.AllArgsConstructor;',
    ]);

    let needsValidation = false;

    // Check if any fields require validation
    if (required.length > 0) {
      needsValidation = true;
    }

    for (const [fieldName, fieldSchema] of Object.entries(properties)) {
      const field: any = fieldSchema;
      
      if (field.type === 'string') {
        if (field.minLength || field.maxLength) {
          imports.add('import jakarta.validation.constraints.Size;');
          needsValidation = true;
        }
        if (field.format === 'email') {
          imports.add('import jakarta.validation.constraints.Email;');
          needsValidation = true;
        }
        if (field.pattern) {
          imports.add('import jakarta.validation.constraints.Pattern;');
          needsValidation = true;
        }
      }
      
      if (field.type === 'integer' || field.type === 'number') {
        if (field.minimum !== undefined) {
          imports.add('import jakarta.validation.constraints.Min;');
          needsValidation = true;
        }
        if (field.maximum !== undefined) {
          imports.add('import jakarta.validation.constraints.Max;');
          needsValidation = true;
        }
      }
    }

    if (required.length > 0) {
      imports.add('import jakarta.validation.constraints.NotNull;');
      imports.add('import jakarta.validation.constraints.NotBlank;');
    }

    return Array.from(imports).sort().join('\n');
  }

  /**
   * Generate field declarations with validation annotations
   */
  private generateFields(properties: any, required: string[]): string {
    const fields: string[] = [];

    for (const [fieldName, fieldSchema] of Object.entries(properties)) {
      const field: any = fieldSchema;
      const javaFieldName = this.toCamelCase(fieldName);
      const javaType = this.mapTypeToJava(field.type, field.format);
      const isRequired = required.includes(fieldName);

      const annotations: string[] = [];
      
      // Required validation
      if (isRequired) {
        if (field.type === 'string') {
          annotations.push('    @NotBlank(message = "' + fieldName + ' is required")');
        } else {
          annotations.push('    @NotNull(message = "' + fieldName + ' is required")');
        }
      }

      // String validations
      if (field.type === 'string') {
        if (field.minLength || field.maxLength) {
          const min = field.minLength || 0;
          const max = field.maxLength || 2147483647;
          annotations.push(`    @Size(min = ${min}, max = ${max}, message = "${fieldName} must be between ${min} and ${max} characters")`);
        }
        if (field.format === 'email') {
          annotations.push(`    @Email(message = "${fieldName} must be a valid email address")`);
        }
        if (field.pattern) {
          annotations.push(`    @Pattern(regexp = "${field.pattern}", message = "${fieldName} must match pattern")`);
        }
      }

      // Numeric validations
      if (field.type === 'integer' || field.type === 'number') {
        if (field.minimum !== undefined) {
          annotations.push(`    @Min(value = ${field.minimum}, message = "${fieldName} must be at least ${field.minimum}")`);
        }
        if (field.maximum !== undefined) {
          annotations.push(`    @Max(value = ${field.maximum}, message = "${fieldName} must be at most ${field.maximum}")`);
        }
      }

      // Generate field with annotations
      const annotationStr = annotations.length > 0 ? annotations.join('\n') + '\n' : '';
      fields.push(`${annotationStr}    private ${javaType} ${javaFieldName};`);
    }

    return fields.join('\n\n');
  }

  /**
   * Map JSON Schema type to Java type
   */
  private mapTypeToJava(type: string, format?: string): string {
    if (type === 'string') {
      return 'String';
    }
    if (type === 'integer') {
      return 'Integer';
    }
    if (type === 'number') {
      return 'Double';
    }
    if (type === 'boolean') {
      return 'Boolean';
    }
    if (type === 'array') {
      return 'List<Object>'; // Generic list, could be enhanced
    }
    if (type === 'object') {
      return 'Object';
    }
    return 'Object'; // Fallback
  }

  /**
   * Convert snake_case or kebab-case to camelCase
   */
  private toCamelCase(str: string): string {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
  }

  /**
   * Convert string to PascalCase
   */
  toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
}
