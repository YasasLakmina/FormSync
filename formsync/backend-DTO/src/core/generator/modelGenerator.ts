import { EntitySchema, GeneratedArtifact } from '../types';
import { getJavaType } from '../typeMapping';
import { getModelAnnotations } from '../ruleEngine';
import { loadTemplate, capitalize } from './utils';

export function generateModel(entity: EntitySchema): GeneratedArtifact {
    const imports = new Set<string>();
    const packageName = entity.packageName;

    const fields = entity.fields.map(field => {
        const javaType = getJavaType(field);
        javaType.imports.forEach(i => imports.add(i));

        const rules = getModelAnnotations(field, packageName);
        rules.imports.forEach(i => imports.add(i));

        return {
            name: field.name,
            type: javaType.type,
            capitalizedName: capitalize(field.name),
            annotations: rules.annotations,
            comments: rules.comments,
        };
    });

    const context = {
        packageName,
        tableName: entity.tableName || entity.entityName.toLowerCase(),
        className: entity.entityName,
        imports: Array.from(imports).sort(),
        fields,
    };

    const template = loadTemplate('model');
    const content = template(context);
    const packagePath = packageName.replace(/\./g, '/');

    return {
        filename: `${entity.entityName}.java`,
        relativePath: `src/main/java/${packagePath}/model/${entity.entityName}.java`,
        content,
    };
}
