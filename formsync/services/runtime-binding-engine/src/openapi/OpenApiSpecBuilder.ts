import {
    InternalSchema,
    SchemaEntity,
    SchemaField,
    DataType,
    SchemaEnum,
} from '../model/InternalModel';

/** Converts a string to kebab-case (e.g. "EmployeeOnboarding" -> "employee-onboarding"). */
function toKebabCase(str: string): string {
    return str
        .replace(/[\s_]+/g, '-')
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/-{2,}/g, '-');
}

/** Pluralized kebab-case resource path segment (e.g. "Employee" -> "employees"). */
function resourcePathSegment(entityName: string): string {
    const kebab = toKebabCase(entityName);
    return kebab + 's';
}

/** OpenAPI 3.0 schema object for a single property. */
interface OpenApiSchemaProperty {
    type?: string;
    format?: string;
    description?: string;
    example?: string | number | boolean;
    enum?: string[];
    items?: Record<string, unknown>;
    required?: string[];
}

/**
 * Build OpenAPI 3.0 schema for a field.
 * When useRefForCompositeTypes is true, ENUM and OBJECT (with referenceType) are emitted as $ref
 * so they appear as separate entries in components.schemas (and in the Schemas tab).
 */
function fieldToOpenApiSchema(
    field: SchemaField,
    enums: SchemaEnum[],
    useRefForCompositeTypes = false
): Record<string, unknown> {
    if (useRefForCompositeTypes && field.type === DataType.ENUM && field.referenceType) {
        return { $ref: `#/components/schemas/${field.referenceType}` };
    }
    if (useRefForCompositeTypes && (field.type === DataType.OBJECT || field.type === DataType.MAP) && field.referenceType) {
        return { $ref: `#/components/schemas/${field.referenceType}` };
    }

    const schema: OpenApiSchemaProperty = {};
    if (field.description) schema.description = field.description;
    if (field.constraints.example !== undefined) schema.example = field.constraints.example;

    switch (field.type) {
        case DataType.STRING:
            schema.type = 'string';
            if (field.constraints.email) schema.format = 'email';
            if (field.constraints.minLength !== undefined) (schema as any).minLength = field.constraints.minLength;
            if (field.constraints.maxLength !== undefined) (schema as any).maxLength = field.constraints.maxLength;
            if (field.constraints.pattern) (schema as any).pattern = field.constraints.pattern;
            break;
        case DataType.INTEGER:
            schema.type = 'integer';
            if (field.constraints.min !== undefined) (schema as any).minimum = field.constraints.min;
            if (field.constraints.max !== undefined) (schema as any).maximum = field.constraints.max;
            break;
        case DataType.LONG:
            schema.type = 'integer';
            schema.format = 'int64';
            if (field.constraints.min !== undefined) (schema as any).minimum = field.constraints.min;
            if (field.constraints.max !== undefined) (schema as any).maximum = field.constraints.max;
            break;
        case DataType.DOUBLE:
        case DataType.BIG_DECIMAL:
            schema.type = 'number';
            if (field.constraints.min !== undefined) (schema as any).minimum = field.constraints.min;
            if (field.constraints.max !== undefined) (schema as any).maximum = field.constraints.max;
            break;
        case DataType.BOOLEAN:
            schema.type = 'boolean';
            break;
        case DataType.LOCAL_DATE:
            schema.type = 'string';
            schema.format = 'date';
            break;
        case DataType.LOCAL_DATE_TIME:
            schema.type = 'string';
            schema.format = 'date-time';
            break;
        case DataType.ENUM:
            schema.type = 'string';
            if (field.referenceType) {
                const enumDef = enums.find((e) => e.name === field.referenceType);
                if (enumDef?.values?.length) schema.enum = enumDef.values;
            }
            break;
        case DataType.LIST:
        case DataType.SET:
            schema.type = 'array';
            if (field.itemType) {
                const itemSchema = fieldToOpenApiSchema(
                    {
                        name: 'item',
                        type: field.itemType,
                        referenceType: field.itemReferenceType,
                        constraints: {},
                    } as SchemaField,
                    enums,
                    useRefForCompositeTypes
                );
                schema.items = itemSchema;
            } else {
                schema.items = { type: 'string' };
            }
            break;
        case DataType.MAP:
        case DataType.OBJECT:
            schema.type = 'object';
            break;
        default:
            schema.type = 'string';
    }

    return schema as Record<string, unknown>;
}

/** Build Request schema for an entity (properties from fields only). Uses $ref for enums and nested objects. */
function buildRequestSchema(entity: SchemaEntity, enums: SchemaEnum[]): Record<string, unknown> {
    const properties: Record<string, Record<string, unknown>> = {};
    const required: string[] = [];

    for (const field of entity.fields) {
        properties[field.name] = fieldToOpenApiSchema(field, enums, true);
        if (field.constraints.required) required.push(field.name);
    }

    const schema: Record<string, unknown> = {
        type: 'object',
        properties,
    };
    if (required.length) schema.required = required;
    return schema;
}

/** Build Response schema for an entity (id + fields). Uses $ref for enums and nested objects. */
function buildResponseSchema(entity: SchemaEntity, enums: SchemaEnum[]): Record<string, unknown> {
    const properties: Record<string, Record<string, unknown>> = {
        id: {
            type: 'integer',
            format: 'int64',
            description: 'Entity ID',
        } as Record<string, unknown>,
    };

    for (const field of entity.fields) {
        properties[field.name] = fieldToOpenApiSchema(field, enums, true);
    }

    return {
        type: 'object',
        properties,
    };
}

/** Build a reusable component schema for a nested entity (e.g. Address). */
function buildEntitySchema(entity: SchemaEntity, enums: SchemaEnum[]): Record<string, unknown> {
    const properties: Record<string, Record<string, unknown>> = {};
    const required: string[] = [];

    for (const field of entity.fields) {
        properties[field.name] = fieldToOpenApiSchema(field, enums, true);
        if (field.constraints.required) required.push(field.name);
    }

    const schema: Record<string, unknown> = {
        type: 'object',
        description: entity.description || undefined,
        properties,
    };
    if (required.length) schema.required = required;
    return schema;
}

/** OpenAPI 3.0 document structure (subset we use). */
export interface OpenApiDocument {
    openapi: string;
    info: { title: string; description?: string; version: string };
    paths: Record<string, Record<string, unknown>>;
    components: { schemas: Record<string, Record<string, unknown>> };
}

/**
 * Builds an OpenAPI 3.0 specification from InternalSchema.
 * Produces paths and components.schemas for all root entities (CRUD).
 * Ensures all models appear in the Schemas tab: enums, nested entities (e.g. Address), Request/Response DTOs.
 */
export function buildOpenApiSpec(schema: InternalSchema): OpenApiDocument {
    const rootEntities = schema.entities.filter((e) => e.isRoot);
    const nestedEntities = schema.entities.filter((e) => !e.isRoot);
    const paths: Record<string, Record<string, unknown>> = {};
    const componentsSchemas: Record<string, Record<string, unknown>> = {};

    // 1. Add all enums as separate schemas so they appear in the Schemas tab
    for (const enumDef of schema.enums) {
        componentsSchemas[enumDef.name] = {
            type: 'string',
            enum: enumDef.values,
            description: `Enum: ${enumDef.name}`,
        } as Record<string, unknown>;
    }

    // 2. Add all nested entities (e.g. Address) as separate schemas
    for (const entity of nestedEntities) {
        componentsSchemas[entity.name] = buildEntitySchema(entity, schema.enums);
    }

    // 3. Add root entity model schema so it appears in Schemas tab (4 models: nested + entity + enums; 2 DTOs: Request + Response)
    for (const entity of rootEntities) {
        componentsSchemas[entity.name] = buildEntitySchema(entity, schema.enums);
    }

    // 4. Add Request/Response DTOs and paths for each root entity
    for (const entity of rootEntities) {
        const resource = resourcePathSegment(entity.name);
        const basePath = `/api/${resource}`;
        const requestRef = `#/components/schemas/${entity.name}Request`;
        const responseRef = `#/components/schemas/${entity.name}Response`;

        componentsSchemas[`${entity.name}Request`] = buildRequestSchema(entity, schema.enums);
        componentsSchemas[`${entity.name}Response`] = buildResponseSchema(entity, schema.enums);

        const entityDesc = entity.description || entity.name;
        const nameLower = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);

        // GET /api/{resource}
        paths[basePath] = {
            get: {
                summary: `List all ${nameLower}s`,
                description: `Retrieve all ${nameLower} entities.`,
                operationId: `getAll${entity.name}s`,
                tags: [entity.name],
                responses: {
                    '200': {
                        description: 'List of entities',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: responseRef },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: `Create a new ${nameLower}`,
                description: `Create a new ${nameLower}. Request body is validated.`,
                operationId: `create${entity.name}`,
                tags: [entity.name],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: requestRef },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Entity created',
                        content: {
                            'application/json': {
                                schema: { $ref: responseRef },
                            },
                        },
                    },
                    '400': { description: 'Validation error' },
                },
            },
        };

        // GET /api/{resource}/{id}, PUT /api/{resource}/{id}, DELETE /api/{resource}/{id}
        const pathWithId = `${basePath}/{id}`;
        paths[pathWithId] = {
            get: {
                summary: `Get ${nameLower} by ID`,
                description: `Retrieve a ${nameLower} by ID.`,
                operationId: `get${entity.name}ById`,
                tags: [entity.name],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', format: 'int64' },
                        description: 'Entity ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Entity found',
                        content: {
                            'application/json': {
                                schema: { $ref: responseRef },
                            },
                        },
                    },
                    '404': { description: 'Entity not found' },
                },
            },
            put: {
                summary: `Update ${nameLower}`,
                description: `Update an existing ${nameLower}. Request body is validated.`,
                operationId: `update${entity.name}`,
                tags: [entity.name],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', format: 'int64' },
                        description: 'Entity ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: requestRef },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Entity updated',
                        content: {
                            'application/json': {
                                schema: { $ref: responseRef },
                            },
                        },
                    },
                    '400': { description: 'Validation error' },
                    '404': { description: 'Entity not found' },
                },
            },
            delete: {
                summary: `Delete ${nameLower}`,
                description: `Delete a ${nameLower} by ID.`,
                operationId: `delete${entity.name}`,
                tags: [entity.name],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', format: 'int64' },
                        description: 'Entity ID',
                    },
                ],
                responses: {
                    '204': { description: 'Entity deleted' },
                    '404': { description: 'Entity not found' },
                },
            },
        };
    }

    return {
        openapi: '3.0.3',
        info: {
            title: schema.appName,
            description: schema.description || `Generated API for ${schema.appName}`,
            version: schema.version,
        },
        paths,
        components: { schemas: componentsSchemas },
    };
}
