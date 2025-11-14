import { EntitySchema, GenerationResult } from '../core/types';
import { generateModel } from '../core/generator/modelGenerator';
import { generateDto } from '../core/generator/dtoGenerator';
import { generateRepository } from '../core/generator/repositoryGenerator';
import { generateService } from '../core/generator/serviceGenerator';
import { generateSecurityArtifacts } from '../core/generator/securityGenerator';

export async function generateBackendFromSchema(schema: EntitySchema): Promise<GenerationResult> {
    // 1. Generate core artifacts
    const model = generateModel(schema);
    const dto = generateDto(schema);
    const repository = generateRepository(schema);
    const service = generateService(schema);

    // 2. Generate common security artifacts
    const commonArtifacts = generateSecurityArtifacts(schema.packageName);

    return {
        entity: schema,
        model,
        dto,
        repository,
        service,
        commonArtifacts,
    };
}
