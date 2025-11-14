import { FieldSchema, RuleResult } from './types';

function mergeResults(...results: RuleResult[]): RuleResult {
    return {
        annotations: results.flatMap(r => r.annotations),
        imports: Array.from(new Set(results.flatMap(r => r.imports))),
        comments: results.flatMap(r => r.comments),
    };
}

// Rules for DTOs (Validation + Security)
export function getDtoAnnotations(field: FieldSchema, packageName: string): RuleResult {
    const result: RuleResult = { annotations: [], imports: [], comments: [] };

    // 1. Required field
    if (!field.nullable) {
        result.annotations.push('@NotNull');
        result.imports.push('jakarta.validation.constraints.NotNull');
    }

    // 2. String length
    if (field.type === 'STRING') {
        const min = field.minLength;
        const max = field.maxLength;
        if (min !== undefined || max !== undefined) {
            const parts = [];
            if (min !== undefined) parts.push(`min = ${min}`);
            if (max !== undefined) parts.push(`max = ${max}`);
            result.annotations.push(`@Size(${parts.join(', ')})`);
            result.imports.push('jakarta.validation.constraints.Size');
        }
    }

    // 3. Numeric range
    if (['INTEGER', 'LONG', 'DOUBLE', 'DECIMAL'].includes(field.type)) {
        if (field.min !== undefined) {
            result.annotations.push(`@Min(${field.min})`);
            result.imports.push('jakarta.validation.constraints.Min');
        }
        if (field.max !== undefined) {
            result.annotations.push(`@Max(${field.max})`);
            result.imports.push('jakarta.validation.constraints.Max');
        }
    }

    // 4. Format - Email
    if (field.validations?.format === 'EMAIL') {
        result.annotations.push('@Email');
        result.imports.push('jakarta.validation.constraints.Email');
    }

    // 5. Format - UUID
    // Even if type is UUID in Java, DTO might receive string that needs pattern validation
    // But usually we bind directly to UUID type which fails if invalid.
    // If field is STRING but format is UUID:
    if (field.type === 'STRING' && field.validations?.format === 'UUID') {
        result.annotations.push('@Pattern(regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")');
        result.imports.push('jakarta.validation.constraints.Pattern');
    }

    // 6. XSS (NoHtml)
    if (field.type === 'STRING' && field.allowHtml === false) {
        result.annotations.push('@NoHtml');
        result.imports.push(`${packageName}.security.validation.NoHtml`);
    }

    // 7. PII
    if (field.isPII) {
        result.annotations.push('@PII');
        result.imports.push(`${packageName}.security.gdpr.PII`);
        result.comments.push('// PII field – handle according to GDPR, do not log raw values.');
    }

    return result;
}

// Rules for Entities (JPA)
export function getModelAnnotations(field: FieldSchema, packageName: string): RuleResult {
    const result: RuleResult = { annotations: [], imports: [], comments: [] };

    // PK
    if (field.primaryKey) {
        result.annotations.push('@Id');
        result.imports.push('jakarta.persistence.Id');

        if (field.validations?.generated === 'UUID' || field.type === 'UUID') {
            result.annotations.push('@GeneratedValue(strategy = GenerationType.AUTO)');
            result.imports.push('jakarta.persistence.GeneratedValue');
            result.imports.push('jakarta.persistence.GenerationType');
        } else if (field.type === 'INTEGER' || field.type === 'LONG') {
            result.annotations.push('@GeneratedValue(strategy = GenerationType.IDENTITY)');
            result.imports.push('jakarta.persistence.GeneratedValue');
            result.imports.push('jakarta.persistence.GenerationType');
        }
    }

    // Column
    const colArgs: string[] = [];
    if (!field.nullable) colArgs.push('nullable = false');
    if (field.maxLength) colArgs.push(`length = ${field.maxLength}`);

    // Always add @Column to be explicit or if args exist
    if (colArgs.length > 0) {
        result.annotations.push(`@Column(${colArgs.join(', ')})`);
    } else {
        // Optional, but good practice
        result.annotations.push(`@Column(name = "${field.name}")`);
    }
    result.imports.push('jakarta.persistence.Column');

    // PII in model
    if (field.isPII) {
        result.annotations.push('@PII');
        result.imports.push(`${packageName}.security.gdpr.PII`);
    }

    return result;
}
