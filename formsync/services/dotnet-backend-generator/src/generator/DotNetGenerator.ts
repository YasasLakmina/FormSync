import * as path from 'path';
import { buildOpenApiYaml } from '@formsync/schema-openapi';
import { FileWriter } from '../service/FileWriter';
import { TemplateService } from '../service/TemplateService';
import { DotNetGeneratorConfig } from '../model/InputContract';

interface FieldDescriptor {
  name: string;
  namePascal: string;
  csType: string;
  defaultValue: string;
  required: boolean;
  isNullable: boolean;
  validationAttributes: string[];
}

interface EntityDescriptor {
  namespace: string;
  name: string;
  nameCamel: string;
  namePlural: string;
  namePluralCamel: string;
  fields: FieldDescriptor[];
}

interface ParsedSchema {
  appName: string;
  namespace: string;
  entities: EntityDescriptor[];
}

function toPascalCase(str: string): string {
  return (str || '')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';
}

function pluralize(name: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(name)) return name + 'es';
  if (/[^aeiou]y$/i.test(name)) return name.slice(0, -1) + 'ies';
  return name + 's';
}

function jsonSchemaToCsType(prop: any): { csType: string; defaultValue: string } {
  if (prop.type === 'boolean') return { csType: 'bool', defaultValue: 'false' };
  if (prop.type === 'integer') return { csType: 'int', defaultValue: '0' };
  if (prop.type === 'number') return { csType: 'double', defaultValue: '0.0' };
  if (prop.type === 'array') return { csType: 'List<string>', defaultValue: 'new()' };
  if (prop.format === 'date' || prop.format === 'date-time') {
    return { csType: 'DateTime', defaultValue: 'default' };
  }
  return { csType: 'string', defaultValue: 'string.Empty' };
}

function buildValidationAttributes(prop: any, isRequired: boolean): string[] {
  const attrs: string[] = [];
  if (isRequired) attrs.push('[Required]');
  if (prop.format === 'email') attrs.push('[EmailAddress]');
  if (prop.format === 'uri' || prop.format === 'url') attrs.push('[Url]');
  if (typeof prop.minLength === 'number') attrs.push(`[MinLength(${prop.minLength})]`);
  if (typeof prop.maxLength === 'number') attrs.push(`[MaxLength(${prop.maxLength})]`);
  if (typeof prop.minimum === 'number' && typeof prop.maximum === 'number') {
    attrs.push(`[Range(${prop.minimum}, ${prop.maximum})]`);
  } else if (typeof prop.minimum === 'number') {
    attrs.push(`[Range(${prop.minimum}, int.MaxValue)]`);
  } else if (typeof prop.maximum === 'number') {
    attrs.push(`[Range(int.MinValue, ${prop.maximum})]`);
  }
  if (prop.pattern) {
    attrs.push(`[RegularExpression(@"${prop.pattern}")]`);
  }
  return attrs;
}

export class DotNetGenerator {
  private templateService: TemplateService;
  private fileWriter: FileWriter;

  constructor() {
    this.templateService = new TemplateService();
    this.fileWriter = new FileWriter();
  }

  private parseSchema(schema: any): ParsedSchema {
    const raw = schema.content || schema;
    const rawName = schema.name || raw.title || 'App';
    const appName = toPascalCase(rawName);
    const namespace = appName;
    const required: string[] = Array.isArray(raw.required) ? raw.required : [];
    const properties = raw.properties || {};

    const fields: FieldDescriptor[] = Object.entries<any>(properties).map(([key, prop]) => {
      const isRequired = required.includes(key);
      const { csType, defaultValue } = jsonSchemaToCsType(prop);
      return {
        name: key,
        namePascal: toPascalCase(key),
        csType,
        defaultValue,
        required: isRequired,
        isNullable: !isRequired && csType === 'string',
        validationAttributes: buildValidationAttributes(prop, isRequired),
      };
    });

    const entityName = appName;
    const entity: EntityDescriptor = {
      namespace,
      name: entityName,
      nameCamel: toCamelCase(entityName),
      namePlural: pluralize(entityName),
      namePluralCamel: toCamelCase(pluralize(entityName)),
      fields,
    };

    return { appName, namespace, entities: [entity] };
  }

  async generate(schema: any, config?: DotNetGeneratorConfig): Promise<void> {
    const outputDir = config?.outputDir || './generated-dotnet-backend';
    const serverPort = config?.serverPort || 5000;
    const includeSwagger = config?.includeSwagger ?? true;

    const { appName, namespace, entities } = this.parseSchema(schema);

    const raw = schema.content || schema;
    const apiVersion = schema.version?.toString() ?? '1.0.0';
    const apiDescription = (
      schema.description ||
      (typeof raw === 'object' && raw?.description) ||
      `Generated API for ${appName}`
    )
      .replace(/\r?\n/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, "'");

    const openApiYaml = buildOpenApiYaml({
      name: appName,
      content: raw,
      version: apiVersion,
      description: schema.description ?? (typeof raw === 'object' ? raw.description : undefined),
    });
    this.fileWriter.write(path.join(outputDir, 'openapi.yaml'), openApiYaml);

    // 1. .csproj
    this.fileWriter.write(
      path.join(outputDir, `${namespace}.csproj`),
      this.templateService.render('csproj', { namespace, appName, includeSwagger }),
    );

    // 2. Program.cs
    this.fileWriter.write(
      path.join(outputDir, 'Program.cs'),
      this.templateService.render('Program', {
        namespace,
        appName,
        serverPort,
        includeSwagger,
        entities,
        apiVersion,
        apiDescription,
      }),
    );

    // 3. appsettings.json
    this.fileWriter.write(
      path.join(outputDir, 'appsettings.json'),
      this.templateService.render('appsettings', { appName, serverPort }),
    );

    // 4. appsettings.Development.json
    this.fileWriter.write(
      path.join(outputDir, 'appsettings.Development.json'),
      this.templateService.render('appsettings-development', { appName }),
    );

    // 5. Shared exception types
    this.fileWriter.write(
      path.join(outputDir, 'Exceptions', 'NotFoundException.cs'),
      this.templateService.render('NotFoundException', { namespace }),
    );
    this.fileWriter.write(
      path.join(outputDir, 'Exceptions', 'ApiErrorResponse.cs'),
      this.templateService.render('ApiErrorResponse', { namespace }),
    );

    // 6. Per-entity files
    for (const entity of entities) {
      const ctx = { ...entity, serverPort, includeSwagger };

      this.fileWriter.write(
        path.join(outputDir, 'Models', `${entity.name}.cs`),
        this.templateService.render('Entity', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'DTOs', `${entity.name}Request.cs`),
        this.templateService.render('RequestDto', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'DTOs', `${entity.name}Response.cs`),
        this.templateService.render('ResponseDto', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'Repositories', `I${entity.name}Repository.cs`),
        this.templateService.render('IRepository', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'Repositories', `${entity.name}Repository.cs`),
        this.templateService.render('Repository', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'Services', `I${entity.name}Service.cs`),
        this.templateService.render('IService', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'Services', `${entity.name}Service.cs`),
        this.templateService.render('Service', ctx),
      );

      this.fileWriter.write(
        path.join(outputDir, 'Controllers', `${entity.namePlural}Controller.cs`),
        this.templateService.render('Controller', ctx),
      );
    }

    // 7. README.md
    this.fileWriter.write(
      path.join(outputDir, 'README.md'),
      this.templateService.render('readme', {
        appName,
        namespace,
        serverPort,
        includeSwagger,
        entities,
        apiVersion,
      }),
    );

    console.log(`DotNetGenerator: Complete ASP.NET Core server generated at ${outputDir}`);
  }
}
