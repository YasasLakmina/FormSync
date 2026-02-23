/**
 * Internal Model Definitions
 *
 * These types represent the schema in a format optimized for generating
 * a complete, ready-to-run Spring Boot server with controllers, services,
 * repositories, entities, DTOs, validations, and exception handling.
 */

export enum DataType {
    STRING = 'String',
    INTEGER = 'Integer',
    LONG = 'Long',
    DOUBLE = 'Double',
    BOOLEAN = 'Boolean',
    LOCAL_DATE = 'LocalDate',
    LOCAL_DATE_TIME = 'LocalDateTime',
    LIST = 'List',
    SET = 'Set',
    MAP = 'Map',
    OBJECT = 'Object',
    ENUM = 'Enum',
    BIG_DECIMAL = 'BigDecimal'
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
    notBlank?: boolean;
    custom?: string;
}

export interface SchemaField {
    name: string;
    type: DataType;
    referenceType?: string;
    itemType?: DataType;
    itemReferenceType?: string;
    description?: string;
    constraints: ValidationConstraints;
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
    appName: string;
    description?: string;
}
