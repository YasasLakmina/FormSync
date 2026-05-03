import {
    InternalSchema,
    SchemaEntity,
    SchemaField,
    DataType,
    ValidationConstraints,
    SchemaEnum
} from './InternalModel';
import { SchemaPayload } from './SchemaPayload';

/**
 * Maps a JSON Schema payload into an InternalSchema optimized for
 * generating servers and OpenAPI docs. Handles nested objects,
 * enums, arrays, format-based validations (email, date, etc.), and
 * JSON Schema validation keywords.
 */
export class SchemaMapper {

    public map(payload: SchemaPayload): InternalSchema {
        const rootSchema = payload.content;
        const entities: SchemaEntity[] = [];
        const enums: SchemaEnum[] = [];

        const rootEntityName = this.capitalize(payload.name) || 'RootEntity';

        if (rootSchema.type === 'object' || rootSchema.properties) {
            this.parseEntity(rootEntityName, rootSchema, entities, enums, true);
        }

        return {
            version: payload.version || '1.0.0',
            appName: rootEntityName,
            description: payload.description || rootSchema.description,
            entities,
            enums
        };
    }

    private parseEntity(
        name: string,
        schema: any,
        entities: SchemaEntity[],
        enums: SchemaEnum[],
        isRoot: boolean = false
    ): void {
        const fields: SchemaField[] = [];

        if (schema.properties) {
            for (const [key, prop] of Object.entries<any>(schema.properties)) {
                const field = this.mapField(key, prop, entities, enums);

                if (schema.required && schema.required.includes(key)) {
                    field.constraints.required = true;

                    if (field.type === DataType.STRING && !field.constraints.email) {
                        field.constraints.notBlank = true;
                    }
                }

                fields.push(field);
            }
        }

        entities.push({
            name,
            description: schema.description,
            fields,
            isRoot
        });
    }

    private mapField(
        name: string,
        schema: any,
        entities: SchemaEntity[],
        enums: SchemaEnum[]
    ): SchemaField {
        const constraints: ValidationConstraints = {
            min: schema.minimum,
            max: schema.maximum,
            minLength: schema.minLength,
            maxLength: schema.maxLength,
            pattern: schema.pattern,
        };

        if (schema.examples && schema.examples.length > 0) {
            constraints.example = String(schema.examples[0]);
        } else if (schema.example !== undefined) {
            constraints.example = String(schema.example);
        } else if (schema.default !== undefined) {
            constraints.example = String(schema.default);
        }

        let type = DataType.STRING;
        let referenceType: string | undefined;
        let itemType: DataType | undefined;
        let itemReferenceType: string | undefined;

        const xFieldType =
            typeof schema['x-field-type'] === 'string' ? (schema['x-field-type'] as string).toLowerCase() : '';

        switch (schema.type) {
            case 'integer':
                type = DataType.INTEGER;
                break;
            case 'number':
                type = DataType.DOUBLE;
                break;
            case 'boolean':
                type = DataType.BOOLEAN;
                break;
            case 'array':
                type = DataType.LIST;
                if (schema.items) {
                    const mappedItem = this.mapField(name + 'Item', schema.items, entities, enums);
                    itemType = mappedItem.type;
                    itemReferenceType = mappedItem.referenceType;
                    referenceType = mappedItem.referenceType || this.getJavaTypeName(mappedItem.type);
                }
                break;
            case 'object':
                type = DataType.OBJECT;
                {
                    const entityName = this.toJavaClassName(name);
                    this.parseEntity(entityName, schema, entities, enums);
                    referenceType = entityName;
                }
                break;
            case 'string':
                if (schema.enum) {
                    type = DataType.ENUM;
                    const enumName = this.capitalize(name) + 'Enum';
                    enums.push({ name: enumName, values: schema.enum });
                    referenceType = enumName;
                } else if (schema.format === 'email') {
                    type = DataType.STRING;
                    constraints.email = true;
                } else if (schema.format === 'uri' || schema.format === 'url') {
                    type = DataType.STRING;
                    constraints.url = true;
                } else if (schema.format === 'date') {
                    type = DataType.LOCAL_DATE;
                } else if (schema.format === 'date-time') {
                    type = DataType.LOCAL_DATE_TIME;
                }
                break;
            default:
                type = DataType.STRING;
        }

        const persistAsLob =
            type === DataType.STRING &&
            (xFieldType === 'signature' || xFieldType === 'file' || xFieldType === 'richtext');

        return {
            name: this.jsonPropertyKeyToJavaIdentifier(name),
            type,
            referenceType,
            itemType,
            itemReferenceType,
            description: schema.description,
            constraints,
            ...(persistAsLob ? { persistAsLob: true } : {}),
        };
    }

    private jsonPropertyKeyToJavaIdentifier(jsonKey: string): string {
        const cleaned = jsonKey.trim();
        if (!cleaned) return 'field';
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(cleaned)) {
            return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
        }
        const parts = cleaned.split(/[^a-zA-Z0-9]+/).filter(Boolean);
        if (parts.length === 0) return 'field';
        let camel =
            parts[0]!.toLowerCase() +
            parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
        if (/^[0-9]/.test(camel)) {
            camel = 'field' + camel.charAt(0).toUpperCase() + camel.slice(1);
        }
        return camel;
    }

    private getJavaTypeName(type: DataType): string {
        const map: Record<string, string> = {
            [DataType.STRING]: 'String',
            [DataType.INTEGER]: 'Integer',
            [DataType.LONG]: 'Long',
            [DataType.DOUBLE]: 'Double',
            [DataType.BOOLEAN]: 'Boolean',
            [DataType.BIG_DECIMAL]: 'BigDecimal',
            [DataType.LOCAL_DATE]: 'LocalDate',
            [DataType.LOCAL_DATE_TIME]: 'LocalDateTime',
        };
        return map[type] || 'String';
    }

    /**
     * PascalCase for enum names and simple tokens (split on spaces/dashes/underscores only).
     */
    private capitalize(s: string): string {
        return s
            .split(/[\s_-]+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    /**
     * Java class name from a JSON property key or synthetic name (handles camelCase like repeatingTableItem).
     */
    private toJavaClassName(identifier: string): string {
        const s = identifier.trim();
        if (!s) return 'Generated';
        const words = s
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_\s-]+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        if (words.length === 0) return 'Generated';
        return words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join('');
    }
}
