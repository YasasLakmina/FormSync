/**
 * Internal Model Definitions
 *
 * These types represent the schema in a format optimized for generating
 * server code and OpenAPI specifications from JSON Schema.
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
    /** Example value from JSON Schema – used by test generators to satisfy @Pattern */
    example?: string;
}

export interface SchemaField {
    name: string;
    type: DataType;
    referenceType?: string;
    itemType?: DataType;
    itemReferenceType?: string;
    description?: string;
    constraints: ValidationConstraints;
    /** When true, JPA entity template emits @Lob (TEXT/CLOB) for large string payloads. */
    persistAsLob?: boolean;
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
