import { FieldSchema } from './types';

export interface JavaType {
    type: string;
    imports: string[];
}

export function getJavaType(field: FieldSchema): JavaType {
    const imports: string[] = [];
    let type = 'String';

    switch (field.type) {
        case 'STRING':
            type = 'String';
            break;
        case 'INTEGER':
            type = 'Integer';
            break;
        case 'LONG':
            type = 'Long';
            break;
        case 'DOUBLE':
            type = 'Double';
            break;
        case 'BOOLEAN':
            type = 'Boolean';
            break;
        case 'UUID':
            type = 'UUID';
            imports.push('java.util.UUID');
            break;
        case 'DATE':
            type = 'LocalDate';
            imports.push('java.time.LocalDate');
            break;
        case 'DATETIME':
            type = 'LocalDateTime';
            imports.push('java.time.LocalDateTime');
            break;
        case 'DECIMAL':
            type = 'BigDecimal';
            imports.push('java.math.BigDecimal');
            break;
        default:
            type = 'String'; // default fallback
    }

    return { type, imports };
}
