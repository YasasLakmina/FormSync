import { EntitySchema, GeneratedArtifact } from '../types';
import { loadTemplate } from './utils';

export function generateService(entity: EntitySchema): GeneratedArtifact {
    const packageName = entity.packageName;
    const context = {
        packageName,
        entityName: entity.entityName,
    };

    const template = loadTemplate('service');
    const content = template(context);
    const packagePath = packageName.replace(/\./g, '/');

    return {
        filename: `${entity.entityName}Service.java`,
        relativePath: `src/main/java/${packagePath}/service/${entity.entityName}Service.java`,
        content,
    };
}
