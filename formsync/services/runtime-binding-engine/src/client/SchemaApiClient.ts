import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { SchemaPayload } from '../model/InputContract';

export interface SchemaApiConfig {
    baseUrl: string;
    authToken?: string;
    timeout?: number;
    retries?: number;
}

export class SchemaApiClient {
    private client: AxiosInstance;

    constructor(private config: SchemaApiConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout || 5000,
            headers: config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {},
        });

        axiosRetry(this.client, {
            retries: config.retries || 3,
            retryDelay: axiosRetry.exponentialDelay,
        });
    }

    public async fetchSchema(schemaId: string): Promise<SchemaPayload> {
        try {
            const response = await this.client.get<SchemaPayload>(`/schemas/${schemaId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to fetch schema ${schemaId}:`, error.message);
            throw error;
        }
    }
}
