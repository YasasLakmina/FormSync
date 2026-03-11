
import { SchemaMapper } from './SchemaMapper';
import { SchemaPayload } from '../model/InputContract';
import { DataType } from '../model/InternalModel';

describe('SchemaMapper', () => {
    let mapper: SchemaMapper;

    beforeEach(() => {
        mapper = new SchemaMapper();
    });

    it('should map a simple schema correctly', () => {
        const payload: SchemaPayload = {
            name: 'User',
            content: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    age: { type: 'integer' }
                },
                required: ['username']
            }
        };

        const result = mapper.map(payload);

        expect(result.entities).toHaveLength(1);
        const userEntity = result.entities[0];
        expect(userEntity.name).toBe('User');
        expect(userEntity.fields).toHaveLength(2);

        const usernameField = userEntity.fields.find(f => f.name === 'username');
        expect(usernameField).toBeDefined();
        expect(usernameField?.type).toBe(DataType.STRING);
        expect(usernameField?.constraints.required).toBe(true);

        const ageField = userEntity.fields.find(f => f.name === 'age');
        expect(ageField).toBeDefined();
        expect(ageField?.type).toBe(DataType.INTEGER);
    });

    it('should map nested objects to new entities', () => {
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

        // Should have Order and Address entities
        expect(result.entities).toHaveLength(2);

        const orderEntity = result.entities.find(e => e.name === 'Order');
        const addressEntity = result.entities.find(e => e.name === 'Address');

        expect(orderEntity).toBeDefined();
        expect(addressEntity).toBeDefined();

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
                        enum: ['ELECTRONICS', 'BOOKS']
                    }
                }
            }
        };

        const result = mapper.map(payload);

        expect(result.enums).toHaveLength(1);
        expect(result.enums[0].name).toBe('CategoryEnum');
        expect(result.enums[0].values).toEqual(['ELECTRONICS', 'BOOKS']);

        const productEntity = result.entities[0];
        const categoryField = productEntity.fields[0];
        expect(categoryField.type).toBe(DataType.ENUM);
        expect(categoryField.referenceType).toBe('CategoryEnum');
    });

    it('should map number to DataType.DOUBLE', () => {
        const payload: SchemaPayload = {
            name: 'Metric',
            content: {
                type: 'object',
                properties: {
                    value: { type: 'number' }
                }
            }
        };
        const result = mapper.map(payload);
        const field = result.entities[0].fields.find(f => f.name === 'value');
        expect(field?.type).toBe(DataType.DOUBLE);
    });

    it('should map boolean to DataType.BOOLEAN', () => {
        const payload: SchemaPayload = {
            name: 'Flag',
            content: {
                type: 'object',
                properties: {
                    active: { type: 'boolean' }
                }
            }
        };
        const result = mapper.map(payload);
        const field = result.entities[0].fields.find(f => f.name === 'active');
        expect(field?.type).toBe(DataType.BOOLEAN);
    });

    it('should map string format date to DataType.LOCAL_DATE', () => {
        const payload: SchemaPayload = {
            name: 'Event',
            content: {
                type: 'object',
                properties: {
                    startDate: { type: 'string', format: 'date' }
                }
            }
        };
        const result = mapper.map(payload);
        const field = result.entities[0].fields.find(f => f.name === 'startDate');
        expect(field?.type).toBe(DataType.LOCAL_DATE);
    });

    it('should map string format date-time to DataType.LOCAL_TIME_TIME', () => {
        const payload: SchemaPayload = {
            name: 'Event',
            content: {
                type: 'object',
                properties: {
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        };
        const result = mapper.map(payload);
        const field = result.entities[0].fields.find(f => f.name === 'createdAt');
        expect(field?.type).toBe(DataType.LOCAL_TIME_TIME);
    });

    it('should map array of primitives to LIST with itemType', () => {
        const payload: SchemaPayload = {
            name: 'Doc',
            content: {
                type: 'object',
                properties: {
                    tags: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            }
        };
        const result = mapper.map(payload);
        const field = result.entities[0].fields.find(f => f.name === 'tags');
        expect(field?.type).toBe(DataType.LIST);
        expect(field?.itemType).toBe(DataType.STRING);
    });

    it('should map array of objects to new entity and LIST with item type', () => {
        const payload: SchemaPayload = {
            name: 'Order',
            content: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                sku: { type: 'string' },
                                qty: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        };
        const result = mapper.map(payload);
        expect(result.entities.length).toBeGreaterThanOrEqual(2);
        const orderEntity = result.entities.find(e => e.name === 'Order');
        const itemsField = orderEntity?.fields.find(f => f.name === 'items');
        expect(itemsField?.type).toBe(DataType.LIST);
        expect(itemsField?.itemType).toBe(DataType.OBJECT);
        expect(itemsField?.itemReferenceType).toBeDefined();
    });

    it('should map validation constraints to field constraints', () => {
        const payload: SchemaPayload = {
            name: 'Validated',
            content: {
                type: 'object',
                properties: {
                    score: { type: 'integer', minimum: 0, maximum: 100 },
                    name: { type: 'string', minLength: 1, maxLength: 50, pattern: '^[a-z]+$' }
                },
                required: ['name']
            }
        };
        const result = mapper.map(payload);
        const scoreField = result.entities[0].fields.find(f => f.name === 'score');
        const nameField = result.entities[0].fields.find(f => f.name === 'name');
        expect(scoreField?.constraints.min).toBe(0);
        expect(scoreField?.constraints.max).toBe(100);
        expect(nameField?.constraints.minLength).toBe(1);
        expect(nameField?.constraints.maxLength).toBe(50);
        expect(nameField?.constraints.pattern).toBe('^[a-z]+$');
        expect(nameField?.constraints.required).toBe(true);
    });

    it('should produce empty entity when schema has no properties', () => {
        const payload: SchemaPayload = {
            name: 'Empty',
            content: {
                type: 'object'
            }
        };
        const result = mapper.map(payload);
        expect(result.entities).toHaveLength(1);
        expect(result.entities[0].name).toBe('Empty');
        expect(result.entities[0].fields).toHaveLength(0);
    });

    it('should use payload.name as root entity name', () => {
        const payload: SchemaPayload = {
            name: 'CustomName',
            content: {
                type: 'object',
                properties: { id: { type: 'string' } }
            }
        };
        const result = mapper.map(payload);
        expect(result.entities[0].name).toBe('CustomName');
    });

    it('should use payload version or default 1.0.0', () => {
        const payload: SchemaPayload = {
            name: 'V',
            version: '2.0.0',
            content: { type: 'object', properties: {} }
        };
        const result = mapper.map(payload);
        expect(result.version).toBe('2.0.0');

        const noVersion: SchemaPayload = {
            name: 'V',
            content: { type: 'object', properties: {} }
        };
        const result2 = mapper.map(noVersion);
        expect(result2.version).toBe('1.0.0');
    });
});
