
import {
    InternalSchema,
    SchemaEntity,
    SchemaField,
    DataType,
    ValidationConstraints,
    SchemaEnum
} from '../model/InternalModel';
import { SchemaPayload } from '../model/InputContract';

export class SchemaMapper {

    public map(payload: SchemaPayload): InternalSchema {
        const rootSchema = payload.content;
        const entities: SchemaEntity[] = [];
        const enums: SchemaEnum[] = [];

        // Assume root is an object that becomes the main entity
        const rootEntityName = this.capitalize(payload.name) || 'RootEntity';

        if (rootSchema.type === 'object' || rootSchema.properties) {
            // Parse root entity
            this.parseEntity(rootEntityName, rootSchema, entities, enums, true);
        }

        return {
            version: payload.version || '1.0.0',
            entities,
            enums
        };
    }

    private parseEntity(name: string, schema: any, entities: SchemaEntity[], enums: SchemaEnum[], isRoot: boolean = false): void {
        const fields: SchemaField[] = [];

        if (schema.properties) {
            for (const [key, prop] of Object.entries<any>(schema.properties)) {
                const field = this.mapField(key, prop, entities, enums);

                // Handle required fields
                if (schema.required && schema.required.includes(key)) {
                    field.constraints.required = true;
                }

                fields.push(field);
            }
        }

        entities.push({
            name: name,
            description: schema.description,
            fields,
            isRoot
        });
    }

    private mapField(name: string, schema: any, entities: SchemaEntity[], enums: SchemaEnum[]): SchemaField {
        const constraints: ValidationConstraints = {
            min: schema.minimum,
            max: schema.maximum,
            minLength: schema.minLength,
            maxLength: schema.maxLength,
            pattern: schema.pattern,
        };

        let type = DataType.STRING;
        let referenceType: string | undefined;
        let itemType: DataType | undefined;
        let itemReferenceType: string | undefined;

        switch (schema.type) {
            case 'integer':
                type = DataType.INTEGER; // simplified, could separate Long
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
                    const mappedItem = this.mapField(name + 'Item', schema.items, entities, enums); // Recursively map item
                    itemType = mappedItem.type;
                    itemReferenceType = mappedItem.referenceType;
                }
                break;
            case 'object':
                type = DataType.OBJECT;
                // Create new entity for nested object
                const entityName = this.capitalize(name);
                this.parseEntity(entityName, schema, entities, enums);
                referenceType = entityName;
                break;
            case 'string':
                if (schema.enum) {
                    type = DataType.ENUM;
                    const enumName = this.capitalize(name) + 'Enum';
                    enums.push({ name: enumName, values: schema.enum });
                    referenceType = enumName;
                } else if (schema.format === 'date') {
                    type = DataType.LOCAL_DATE;
                } else if (schema.format === 'date-time') {
                    type = DataType.LOCAL_TIME_TIME;
                }
                break;
            default:
                type = DataType.STRING;
        }

        return {
            name,
            type,
            referenceType,
            itemType,
            itemReferenceType,
            description: schema.description,
            constraints
        };
    }

    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
