import { SchemaMapper } from './SchemaMapper';
import { SchemaPayload } from './SchemaPayload';
import { DataType } from './InternalModel';

describe('SchemaMapper', () => {
    let mapper: SchemaMapper;

    beforeEach(() => {
        mapper = new SchemaMapper();
    });

    it('should map a simple schema with required fields', () => {
        const payload: SchemaPayload = {
            name: 'Employee',
            content: {
                type: 'object',
                properties: {
                    employeeId: { type: 'string', pattern: '^[A-Za-z0-9]+$' },
                    fullName: { type: 'string', minLength: 1, maxLength: 50 },
                    age: { type: 'integer', minimum: 0, maximum: 150 }
                },
                required: ['employeeId', 'fullName', 'age']
            }
        };

        const result = mapper.map(payload);

        expect(result.appName).toBe('Employee');
        expect(result.entities).toHaveLength(1);

        const entity = result.entities[0];
        expect(entity.name).toBe('Employee');
        expect(entity.isRoot).toBe(true);
        expect(entity.fields).toHaveLength(3);

        const employeeIdField = entity.fields.find(f => f.name === 'employeeId');
        expect(employeeIdField?.type).toBe(DataType.STRING);
        expect(employeeIdField?.constraints.required).toBe(true);
        expect(employeeIdField?.constraints.notBlank).toBe(true);
        expect(employeeIdField?.constraints.pattern).toBe('^[A-Za-z0-9]+$');

        const fullNameField = entity.fields.find(f => f.name === 'fullName');
        expect(fullNameField?.constraints.minLength).toBe(1);
        expect(fullNameField?.constraints.maxLength).toBe(50);

        const ageField = entity.fields.find(f => f.name === 'age');
        expect(ageField?.type).toBe(DataType.INTEGER);
        expect(ageField?.constraints.min).toBe(0);
        expect(ageField?.constraints.max).toBe(150);
    });

    it('should set persistAsLob for x-field-type signature, file, and richtext', () => {
        const payload: SchemaPayload = {
            name: 'Jobs',
            content: {
                type: 'object',
                properties: {
                    signaturePad: { type: 'string', 'x-field-type': 'signature' },
                    attachment: { type: 'string', 'x-field-type': 'file' },
                    notes: { type: 'string', 'x-field-type': 'richtext' },
                    title: { type: 'string', 'x-field-type': 'typeahead' },
                },
            },
        };

        const result = mapper.map(payload);
        const fields = result.entities[0].fields;
        expect(fields.find((f) => f.name === 'signaturePad')?.persistAsLob).toBe(true);
        expect(fields.find((f) => f.name === 'attachment')?.persistAsLob).toBe(true);
        expect(fields.find((f) => f.name === 'notes')?.persistAsLob).toBe(true);
        expect(fields.find((f) => f.name === 'title')?.persistAsLob).toBeFalsy();
    });

    it('should map email format to email constraint', () => {
        const payload: SchemaPayload = {
            name: 'User',
            content: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' }
                },
                required: ['email']
            }
        };

        const result = mapper.map(payload);
        const emailField = result.entities[0].fields.find(f => f.name === 'email');

        expect(emailField?.type).toBe(DataType.STRING);
        expect(emailField?.constraints.email).toBe(true);
        expect(emailField?.constraints.required).toBe(true);
        expect(emailField?.constraints.notBlank).toBeFalsy();
    });

    it('should map boolean and number fields correctly', () => {
        const payload: SchemaPayload = {
            name: 'Config',
            content: {
                type: 'object',
                properties: {
                    isActive: { type: 'boolean' },
                    salary: { type: 'number', minimum: 0, maximum: 1000000 }
                },
                required: ['isActive', 'salary']
            }
        };

        const result = mapper.map(payload);
        const boolField = result.entities[0].fields.find(f => f.name === 'isActive');
        const numField = result.entities[0].fields.find(f => f.name === 'salary');

        expect(boolField?.type).toBe(DataType.BOOLEAN);
        expect(numField?.type).toBe(DataType.DOUBLE);
        expect(numField?.constraints.min).toBe(0);
        expect(numField?.constraints.max).toBe(1000000);
    });

    it('should map array of objects to List with PascalCase item embeddable name', () => {
        const payload: SchemaPayload = {
            name: 'NewForm',
            content: {
                type: 'object',
                properties: {
                    repeatingTable: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                text: { type: 'string' },
                                age: { type: 'integer' },
                            },
                        },
                    },
                },
            },
        };

        const result = mapper.map(payload);
        const itemEntity = result.entities.find((e) => e.name === 'RepeatingTableItem');
        expect(itemEntity).toBeDefined();
        expect(itemEntity?.fields.map((f) => f.name).sort()).toEqual(['age', 'text']);

        const root = result.entities.find((e) => e.name === 'NewForm');
        const rtField = root?.fields.find((f) => f.name === 'repeatingTable');
        expect(rtField?.type).toBe(DataType.LIST);
        expect(rtField?.referenceType).toBe('RepeatingTableItem');
    });

    it('should map nested objects to separate entities', () => {
        const payload: SchemaPayload = {
            name: 'Order',
            content: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    address: {
                        type: 'object',
                        properties: {
                            street: { type: 'string' },
                            city: { type: 'string' }
                        }
                    }
                }
            }
        };

        const result = mapper.map(payload);
        expect(result.entities).toHaveLength(2);

        const orderEntity = result.entities.find(e => e.name === 'Order');
        const addressEntity = result.entities.find(e => e.name === 'Address');
        expect(orderEntity).toBeDefined();
        expect(addressEntity).toBeDefined();
        expect(orderEntity?.isRoot).toBe(true);
        expect(addressEntity?.isRoot).toBeFalsy();

        const addressField = orderEntity?.fields.find(f => f.name === 'address');
        expect(addressField?.type).toBe(DataType.OBJECT);
        expect(addressField?.referenceType).toBe('Address');
    });

    it('should map enums correctly', () => {
        const payload: SchemaPayload = {
            name: 'Product',
            content: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        enum: ['ELECTRONICS', 'BOOKS', 'CLOTHING']
                    }
                }
            }
        };

        const result = mapper.map(payload);
        expect(result.enums).toHaveLength(1);
        expect(result.enums[0].name).toBe('CategoryEnum');
        expect(result.enums[0].values).toEqual(['ELECTRONICS', 'BOOKS', 'CLOTHING']);

        const field = result.entities[0].fields[0];
        expect(field.type).toBe(DataType.ENUM);
        expect(field.referenceType).toBe('CategoryEnum');
    });

    it('should handle date and date-time formats', () => {
        const payload: SchemaPayload = {
            name: 'Event',
            content: {
                type: 'object',
                properties: {
                    startDate: { type: 'string', format: 'date' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        };

        const result = mapper.map(payload);
        const dateField = result.entities[0].fields.find(f => f.name === 'startDate');
        const dateTimeField = result.entities[0].fields.find(f => f.name === 'createdAt');

        expect(dateField?.type).toBe(DataType.LOCAL_DATE);
        expect(dateTimeField?.type).toBe(DataType.LOCAL_DATE_TIME);
    });

    it('should map the full Employee schema from FormSync', () => {
        const payload: SchemaPayload = {
            name: 'Employee',
            content: {
                type: 'object',
                properties: {
                    employeeId: { type: 'string', pattern: '^[A-Za-z0-9]+$' },
                    fullName: { type: 'string', minLength: 1, maxLength: 50 },
                    email: { type: 'string', format: 'email' },
                    age: { type: 'integer', minimum: 0, maximum: 150 },
                    department: { type: 'string', minLength: 1, maxLength: 50 },
                    salary: { type: 'number', minimum: 0, maximum: 1000000 },
                    isPermanent: { type: 'boolean' }
                },
                required: ['employeeId', 'fullName', 'email', 'age', 'department', 'salary', 'isPermanent']
            }
        };

        const result = mapper.map(payload);

        expect(result.appName).toBe('Employee');
        expect(result.entities).toHaveLength(1);
        expect(result.enums).toHaveLength(0);

        const entity = result.entities[0];
        expect(entity.fields).toHaveLength(7);
        expect(entity.isRoot).toBe(true);

        entity.fields.forEach(f => {
            expect(f.constraints.required).toBe(true);
        });
    });
});
