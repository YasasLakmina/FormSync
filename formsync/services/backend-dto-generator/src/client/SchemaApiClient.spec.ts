import axios from 'axios';
import { SchemaApiClient } from './SchemaApiClient';
import { SchemaPayload } from '../model/InputContract';

const mockGet = jest.fn();

jest.mock('axios', () => ({
    create: jest.fn(() => ({
        get: mockGet,
    })),
}));

jest.mock('axios-retry', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('SchemaApiClient', () => {
    let client: SchemaApiClient;

    beforeEach(() => {
        jest.clearAllMocks();
        client = new SchemaApiClient({ baseUrl: 'http://localhost:3000/schema' });
    });

    it('should fetch schema by id and return payload', async () => {
        const payload: SchemaPayload = {
            name: 'User',
            content: { type: 'object', properties: { id: { type: 'string' } } },
            version: '1.0.0',
        };
        mockGet.mockResolvedValue({ data: payload });

        const result = await client.fetchSchema('schema-123');

        expect(mockGet).toHaveBeenCalledWith('/schemas/schema-123');
        expect(result).toEqual(payload);
        expect(result.name).toBe('User');
        expect(result.content).toEqual({ type: 'object', properties: { id: { type: 'string' } } });
    });

    it('should throw when fetch fails', async () => {
        const err = new Error('Not found');
        mockGet.mockRejectedValue(err);

        await expect(client.fetchSchema('missing')).rejects.toThrow('Not found');
        expect(mockGet).toHaveBeenCalledWith('/schemas/missing');
    });
});
