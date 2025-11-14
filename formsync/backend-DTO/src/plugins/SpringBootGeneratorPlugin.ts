import { BackendGeneratorPlugin, BasePlugin } from '@formsync/plugins';
import { generateBackendFromSchema } from '../api/generateBackend';
import { EntitySchema, GenerationResult } from '../core/types';

export class SpringBootGeneratorPlugin extends BasePlugin implements BackendGeneratorPlugin {
    public readonly type = 'generator';
    public readonly name = 'spring-boot-generator';

    async generate(schema: EntitySchema): Promise<GenerationResult> {
        return generateBackendFromSchema(schema);
    }
}
