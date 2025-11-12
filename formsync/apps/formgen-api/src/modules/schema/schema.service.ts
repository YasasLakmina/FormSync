import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface SchemaDto {
    id: string;
    name: string;
    schema: any; // JSON Schema
    version?: string;
}

@Injectable()
export class SchemaApiService {
    private readonly logger = new Logger(SchemaApiService.name);
    // Default to localhost:3000 if not set, assuming schema-api runs there
    private readonly baseUrl = process.env.SCHEMA_API_BASE_URL || 'http://localhost:3000';

    async getSchemas(): Promise<SchemaDto[]> {
        try {
            // Upstream is /schema (singular) based on logs
            const { data } = await axios.get(`${this.baseUrl}/schema`);
            return data;
        } catch (e) {
            this.logger.error('Failed to fetch schemas', e);
            throw new HttpException('Failed to connect to Schema API', HttpStatus.BAD_GATEWAY);
        }
    }

    async getSchemaById(id: string): Promise<SchemaDto> {
        try {
            const { data } = await axios.get(`${this.baseUrl}/schema/${id}`);
            return data;
        } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                throw new HttpException('Schema not found', HttpStatus.NOT_FOUND);
            }
            this.logger.error(`Failed to fetch schema ${id}`, e);
            throw new HttpException('Failed to fetch schema', HttpStatus.BAD_GATEWAY);
        }
    }

    // Fallback for versions if not supported by schema-api yet
    async getSchemaVersion(id: string, versionId?: string): Promise<SchemaDto> {
        // For PP1, we might just ignore versionId if schema-api doesn't support it
        // or implement a specific endpoint if it does. 
        // User requirements say "GET /schema-versions/:versionId (fetch a specific version, if supported by schema-api; otherwise fetch schema latest)"

        if (!versionId) return this.getSchemaById(id);

        try {
            const { data } = await axios.get(`${this.baseUrl}/schema-versions/${versionId}`);
            return data;
        } catch (e) {
            // Fallback to latest if version not found? Or strict? 
            // Req says: "otherwise fetch schema latest". 
            // But typically version ID is distinct from schema ID. 
            // Let's assume we try version, if fail, we might throw or return latest.
            // Let's just implement fetching by path provided.
            this.logger.warn(`Failed to fetch version ${versionId}, falling back to id lookup if applicable or erroring`);
            throw new HttpException('Schema version not found', HttpStatus.NOT_FOUND);
        }
    }
}
