
/**
 * Internal Model Definitions
 * 
 * These types represent the schema in a format optimized for code generation
 * (Java/Spring Boot), abstracting away JSON Schema specifics.
 */

export enum DataType {
    STRING = 'String',
    INTEGER = 'Integer',
    LONG = 'Long',
    DOUBLE = 'Double',
    BOOLEAN = 'Boolean',
    LOCAL_DATE = 'LocalDate',
    LOCAL_TIME_TIME = 'LocalDateTime',
    LIST = 'List',
    SET = 'Set',
    MAP = 'Map',
    OBJECT = 'Object', // For nested custom types
    ENUM = 'Enum'
}

export interface ValidationConstraints {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    email?: boolean;
    url?: boolean;
    custom?: string; // Custom validation logic references
}

export interface SchemaField {
    name: string;
    type: DataType;
    // If type is OBJECT or ENUM, this refers to the definition name
    referenceType?: string;
    // If type is LIST/SET, this is the type of the items
    itemType?: DataType;
    itemReferenceType?: string;

    description?: string;
    constraints: ValidationConstraints;

    // Relationship metadata (if applicable)
    relation?: {
        type: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
        targetEntity: string;
    };
}

export interface SchemaEntity {
    name: string;
    description?: string;
    fields: SchemaField[];
    isRoot?: boolean;
}

export interface SchemaEnum {
    name: string;
    values: string[];
}

export interface InternalSchema {
    version: string;
    entities: SchemaEntity[];
    enums: SchemaEnum[];
}
