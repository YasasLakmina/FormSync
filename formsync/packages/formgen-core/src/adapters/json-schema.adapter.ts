import {
    FormModel,
    FieldModel,
    FieldType,
    LayoutConfig,
    ThemeConfig,
    FieldConstraints,
} from '../models/form-model';

/**
 * Minimal internal JSON Schema interface to avoid external dependencies.
 * Focusing on Draft-7 features relevant to form generation.
 */
export interface JsonSchema {
    $id?: string;
    title?: string;
    description?: string;
    type?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    enum?: (string | number)[];
    default?: string | number | boolean | null;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    format?: string;
    items?: JsonSchema; // For arrays
    [key: string]: unknown; // Allow other props but ignore them
}

/**
 * Normalizes a key (camelCase) into a human-readable label.
 * e.g., "firstName" -> "First Name"
 */
function humanizeLabel(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

/**
 * Maps a JSON Schema property to a FormGen FieldModel.
 * Fail-safe: Returns type 'unknown' for unsupported schema constructs.
 */
function mapPropertyToField(
    key: string,
    schema: JsonSchema,
    requiredFields: string[] = []
): FieldModel {
    const isRequired = requiredFields.includes(key);
    const label = schema.title || humanizeLabel(key);

    // 1. Determine Field Type
    let type: FieldType = 'unknown';

    if (schema.enum) {
        type = 'select';
    } else if (schema.type === 'boolean') {
        type = 'checkbox';
    } else if (schema.type === 'integer' || schema.type === 'number') {
        type = 'number';
    } else if (schema.type === 'string') {
        if (schema.format === 'date' || schema.format === 'date-time') {
            type = 'date';
        } else if (schema.format === 'email') {
            type = 'email';
        } else {
            type = 'text'; // Default string
        }
    }

    // 2. Map Constraints (Serializable only)
    const constraints: FieldConstraints = {};
    if (schema.minimum !== undefined) constraints.min = schema.minimum;
    if (schema.maximum !== undefined) constraints.max = schema.maximum;
    if (schema.minLength !== undefined) constraints.minLength = schema.minLength;
    if (schema.maxLength !== undefined) constraints.maxLength = schema.maxLength;
    if (schema.pattern !== undefined) constraints.pattern = schema.pattern;
    if (schema.enum !== undefined) constraints.enum = schema.enum.map(String);

    // 3. Construct FieldModel
    const field: FieldModel = {
        id: `field-${key}`, // Stable ID
        key,
        type,
        label,
        required: isRequired,
        constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
        ui: {}, // Empty defaults
    };

    // 4. Default Value (Safety Check)
    if (schema.default !== undefined &&
        (typeof schema.default === 'string' ||
            typeof schema.default === 'number' ||
            typeof schema.default === 'boolean')) {
        field.defaultValue = schema.default;
    }

    return field;
}

/**
 * Main Adapter Function: JSON Schema -> FormModel
 */
export function parseJsonSchemaToFormModel(schema: JsonSchema): FormModel {
    const fields: FieldModel[] = [];
    const properties = schema.properties || {};
    const required = schema.required || [];

    // 1. Map Fields
    for (const [key, propSchema] of Object.entries(properties)) {
        // Graceful handling: If propSchema is undefined/malformed, skip or handle safely
        if (propSchema && typeof propSchema === 'object') {
            fields.push(mapPropertyToField(key, propSchema, required));
        }
    }

    // 2. Generate Layout (Default Order)
    const layout: LayoutConfig = {
        order: fields.map((f) => f.id),
    };

    // 3. Default Theme
    const theme: ThemeConfig = {
        primaryColor: '#000000',
        fontFamily: 'Inter, sans-serif',
        radius: 4,
    };

    // 4. Construct Final Model
    return {
        id: schema.$id || 'form-' + Date.now().toString(36), // Fallback ID
        name: schema.title || 'Untitled Form',
        version: '1.0.0',
        meta: {
            title: schema.title,
            description: schema.description,
        },
        theme,
        layout,
        fields,
    };
}
