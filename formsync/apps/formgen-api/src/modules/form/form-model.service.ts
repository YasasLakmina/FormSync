import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SchemaApiService } from '../schema/schema.service';
import { registry, JsonSchemaAdapterPlugin, FormModel } from '@formsync/formgen-core';

@Injectable()
export class FormModelService {
    constructor(private readonly schemaService: SchemaApiService) {
        // Register adapter
        registry.register(new JsonSchemaAdapterPlugin());
    }

    async createFromSchemaId(schemaId: string, versionId?: string): Promise<FormModel> {
        const start = Date.now();
        let schemaData;

        // Fetch schema
        if (versionId) {
            schemaData = await this.schemaService.getSchemaVersion(schemaId, versionId);
        } else {
            schemaData = await this.schemaService.getSchemaById(schemaId);
        }

        // Transform
        const adapter = registry.get<JsonSchemaAdapterPlugin>('schema-adapter', 'json-schema-adapter');
        if (!adapter) throw new Error('Schema Adapter not found');

        const formModel = adapter.transform(schemaData.schema || schemaData); // schema-api might return wrapped object

        return formModel;
    }

    async createFromRawSchema(schema: any): Promise<FormModel> {
        const adapter = registry.get<JsonSchemaAdapterPlugin>('schema-adapter', 'json-schema-adapter');
        if (!adapter) throw new Error('Schema Adapter not found');
        return adapter.transform(schema);
    }
}
