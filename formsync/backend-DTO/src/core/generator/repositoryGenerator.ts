import { EntitySchema, GeneratedArtifact } from '../types';
import { loadTemplate } from './utils';

export function generateRepository(entity: EntitySchema): GeneratedArtifact {
    const packageName = entity.packageName;
    const context = {
        packageName,
        entityName: entity.entityName,
    };

    const template = loadTemplate('repository');
    const content = template(context);
    const packagePath = packageName.replace(/\./g, '/');

    return {
        filename: `${entity.entityName}Repository.java`,
        relativePath: `src/main/java/${packagePath}/repository/${entity.entityName}Repository.java`,
        content,
    };
}
