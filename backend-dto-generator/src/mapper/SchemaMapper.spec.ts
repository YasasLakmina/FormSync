
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
});
