import { EntitySchema, GeneratedArtifact } from '../types';
import { getJavaType } from '../typeMapping';
import { getDtoAnnotations } from '../ruleEngine';
import { loadTemplate, capitalize } from './utils';

export function generateDto(entity: EntitySchema): GeneratedArtifact {
    const imports = new Set<string>();
    const packageName = entity.packageName;

    const fields = entity.fields.map(field => {
        const javaType = getJavaType(field);
        javaType.imports.forEach(i => imports.add(i));

        const rules = getDtoAnnotations(field, packageName);
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
        className: `${entity.entityName}DTO`,
        imports: Array.from(imports).sort(),
        fields,
    };

    const template = loadTemplate('dto');
    const content = template(context);
    const packagePath = packageName.replace(/\./g, '/');

    return {
        filename: `${entity.entityName}DTO.java`,
        relativePath: `src/main/java/${packagePath}/dto/${entity.entityName}DTO.java`,
        content,
    };
}
