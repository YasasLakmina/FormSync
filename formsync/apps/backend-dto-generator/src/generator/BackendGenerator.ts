
import { BackendGeneratorPlugin, BasePlugin, BackendGeneratorConfig } from '@formsync/plugins';
import { SchemaApiClient } from '../client/SchemaApiClient';
import { SchemaMapper } from '../mapper/SchemaMapper';
import { InternalSchema } from '../model/InternalModel';

export class BackendGenerator extends BasePlugin implements BackendGeneratorPlugin {
    private mapper: SchemaMapper;

    constructor() {
        super();
        this.mapper = new SchemaMapper();
        console.log('BackendGenerator initialized');
    }

    async generate(schema: any, config?: BackendGeneratorConfig): Promise<void> {
        console.log('BackendGenerator: Starting generation process...');

        // In a real flow, 'schema' argument might be a direct schema object OR a reference to fetch.
        // However, keeping with the previous interface:

        try {
            let internalModel: InternalSchema;

            // If schema looks like our SchemaPayload (from API), map it directly
            if (schema.content && (schema.name || schema.id)) {
                console.log('Mapping SchemaPayload to Internal Model...');
                internalModel = this.mapper.map(schema);
            } else {
                // Fallback: assume it's just a raw JSON schema content with a default name
                console.log('Mapping raw JSON Schema to Internal Model...');
                internalModel = this.mapper.map({
                    name: 'GeneratedSchema',
                    content: schema
                });
            }

            console.log('Internal Model created successfully.');
            console.log('Entities found:', internalModel.entities.map(e => e.name).join(', '));

            // TODO: Pass internalModel to Code Writer (next phase)

        } catch (error: any) {
            console.error('Error during generation:', error);
            throw error;
        }

        console.log('BackendGenerator: Generation complete.');
    }
}
