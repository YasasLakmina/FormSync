import { SchemaMapper } from '../mapper/SchemaMapper';
import { InternalSchema } from '../model/InternalModel';
import { SpringBootGeneratorConfig } from '../model/InputContract';
import { TemplateService } from '../service/TemplateService';
import { FileWriter } from '../service/FileWriter';
import { buildOpenApiSpec } from '../openapi/OpenApiSpecBuilder';
import * as yaml from 'js-yaml';
import * as path from 'path';

/** Derives a Java base package from a schema name (e.g. "Employee" -> "com.employee"). */
function schemaNameToBasePackage(name: string): string {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app';
    return `com.${normalized}`;
}

/**
 * Generates a complete, ready-to-run Spring Boot backend server
 * from a JSON Schema. Produces:
 *   - pom.xml with all dependencies
 *   - application.yml with DB & server config
 *   - Application main class
 *   - JPA Entity with validations
 *   - Request DTO with validations
 *   - Response DTO
 *   - Repository interface
 *   - Service layer with DTO mapping
 *   - REST Controller with @Valid
 *   - GlobalExceptionHandler
 *   - ResourceNotFoundException
 *   - ApiError response model
 *   - Enum classes (if any)
 */
export class SpringBootGenerator {
    private mapper: SchemaMapper;
    private templateService: TemplateService;
    private fileWriter: FileWriter;

    constructor() {
        this.mapper = new SchemaMapper();
        this.templateService = new TemplateService();
        this.fileWriter = new FileWriter();
    }

    async generate(schema: any, config?: SpringBootGeneratorConfig): Promise<void> {
        const outputDir = config?.outputDir || './generated-output';
        const serverPort = config?.serverPort || 8080;
        const includeSwagger = config?.includeSwagger ?? true;
        const database = config?.database || 'h2';

        try {
            let internalModel: InternalSchema;

            if (schema.content && (schema.name || schema.id)) {
                internalModel = this.mapper.map(schema);
            } else {
                internalModel = this.mapper.map({
                    name: schema.title || 'App',
                    description: schema.description,
                    content: schema
                });
            }

            const appName = internalModel.appName;
            const basePackage = config?.basePackage ?? schemaNameToBasePackage(appName);
            const packagePath = basePackage.replace(/\./g, '/');

            // ── 1. pom.xml ──
            const pomContent = this.templateService.render('pom', {
                name: appName,
                version: internalModel.version,
                description: internalModel.description || `Generated Spring Boot Application for ${appName}`,
                basePackage,
                includeSwagger,
                database
            });
            this.fileWriter.write(path.join(outputDir, 'pom.xml'), pomContent);

            // ── 2. application.yml ──
            const ymlContent = this.templateService.render('application-yml', {
                name: appName,
                serverPort,
                basePackage,
                database,
                includeSwagger,
                version: internalModel.version,
                description: internalModel.description
            });
            this.fileWriter.write(
                path.join(outputDir, 'src/main/resources/application.yml'),
                ymlContent
            );

            // ── 3. Main Application class ──
            const appContent = this.templateService.render('application', {
                appName,
                basePackage
            });
            this.fileWriter.write(
                path.join(outputDir, 'src/main/java', packagePath, `${appName}Application.java`),
                appContent
            );

            // ── 4. Exception classes (shared, not per-entity) ──
            const notFoundContent = this.templateService.render('not-found-exception', { basePackage });
            this.fileWriter.write(
                path.join(outputDir, 'src/main/java', packagePath, 'exception', 'ResourceNotFoundException.java'),
                notFoundContent
            );

            const apiErrorContent = this.templateService.render('api-error', { basePackage });
            this.fileWriter.write(
                path.join(outputDir, 'src/main/java', packagePath, 'exception', 'ApiError.java'),
                apiErrorContent
            );

            const exHandlerContent = this.templateService.render('exception-handler', { basePackage });
            this.fileWriter.write(
                path.join(outputDir, 'src/main/java', packagePath, 'exception', 'GlobalExceptionHandler.java'),
                exHandlerContent
            );

            // ── 4b. OpenAPI config (when Swagger enabled) ──
            if (includeSwagger) {
                const openApiConfigContent = this.templateService.render('openapi-config', {
                    basePackage,
                    appName,
                    version: internalModel.version,
                    description: internalModel.description,
                });
                this.fileWriter.write(
                    path.join(outputDir, 'src/main/java', packagePath, 'config', 'OpenApiConfig.java'),
                    openApiConfigContent
                );
            }

            // ── 5. Enums ──
            for (const enumDef of internalModel.enums) {
                const enumContent = this.templateService.render('enum', {
                    ...enumDef,
                    basePackage
                });
                this.fileWriter.write(
                    path.join(outputDir, 'src/main/java', packagePath, 'model', `${enumDef.name}.java`),
                    enumContent
                );
            }

            // ── 5b. OpenAPI 3 spec (openapi.yaml) ──
            const openApiDoc = buildOpenApiSpec(internalModel);
            const openApiYaml = yaml.dump(openApiDoc, { lineWidth: -1 });
            this.fileWriter.write(path.join(outputDir, 'openapi.yaml'), openApiYaml);
            this.fileWriter.write(
                path.join(outputDir, 'src/main/resources/static/openapi.yaml'),
                openApiYaml
            );

            // ── 6. Per-entity generation ──
            for (const entity of internalModel.entities) {
                const nameLower = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
                const context = {
                    ...entity,
                    basePackage,
                    nameLower,
                    includeSwagger,
                    appName,
                    version: internalModel.version,
                    description: internalModel.description
                };

                // Entity
                const entityContent = this.templateService.render('entity', context);
                this.fileWriter.write(
                    path.join(outputDir, 'src/main/java', packagePath, 'model', `${entity.name}.java`),
                    entityContent
                );

                // Only generate full stack for root entities
                if (entity.isRoot) {
                    // Request DTO
                    const dtoReqContent = this.templateService.render('dto-request', context);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/main/java', packagePath, 'dto', `${entity.name}Request.java`),
                        dtoReqContent
                    );

                    // Response DTO
                    const dtoResContent = this.templateService.render('dto-response', context);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/main/java', packagePath, 'dto', `${entity.name}Response.java`),
                        dtoResContent
                    );

                    // Repository
                    const repoContent = this.templateService.render('repository', context);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/main/java', packagePath, 'repository', `${entity.name}Repository.java`),
                        repoContent
                    );

                    // Service
                    const serviceContent = this.templateService.render('service', context);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/main/java', packagePath, 'service', `${entity.name}Service.java`),
                        serviceContent
                    );

                    // Controller
                    const controllerContent = this.templateService.render('controller', context);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/main/java', packagePath, 'controller', `${entity.name}Controller.java`),
                        controllerContent
                    );
                }
            }

            // ── 7. README.md ──
            const rootEntities = internalModel.entities.filter(e => e.isRoot).map(e => ({
                ...e,
                nameLower: e.name.charAt(0).toLowerCase() + e.name.slice(1)
            }));
            const readmeContent = this.templateService.render('readme', {
                appName,
                basePackage,
                serverPort,
                database,
                includeSwagger,
                entities: rootEntities,
                schemaJson: JSON.stringify(schema.content || schema, null, 2)
            });
            this.fileWriter.write(path.join(outputDir, 'README.md'), readmeContent);

            // ── 8. Test resources – application.yml ──
            const testYmlContent = this.templateService.render('application-test-yml', {
                appName
            });
            this.fileWriter.write(
                path.join(outputDir, 'src/test/resources/application.yml'),
                testYmlContent
            );

            // ── 9. Application context test ──
            const appTestContent = this.templateService.render('application-test', {
                appName,
                basePackage
            });
            this.fileWriter.write(
                path.join(outputDir, 'src/test/java', packagePath, `${appName}ApplicationTest.java`),
                appTestContent
            );

            // ── 10. Per-entity test generation ──
            for (const entity of internalModel.entities) {
                if (entity.isRoot) {
                    const nameLower = entity.name.charAt(0).toLowerCase() + entity.name.slice(1);
                    const testContext = { ...entity, basePackage, nameLower };

                    // Controller integration test
                    const controllerTestContent = this.templateService.render('controller-test', testContext);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/test/java', packagePath, 'controller', `${entity.name}ControllerTest.java`),
                        controllerTestContent
                    );

                    // Service unit test
                    const serviceTestContent = this.templateService.render('service-test', testContext);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/test/java', packagePath, 'service', `${entity.name}ServiceTest.java`),
                        serviceTestContent
                    );

                    // Repository test
                    const repoTestContent = this.templateService.render('repository-test', testContext);
                    this.fileWriter.write(
                        path.join(outputDir, 'src/test/java', packagePath, 'repository', `${entity.name}RepositoryTest.java`),
                        repoTestContent
                    );
                }
            }

            console.log(`SpringBootGenerator: Complete server generated at ${outputDir}`);

        } catch (error: any) {
            console.error('Error during Spring Boot generation:', error);
            throw error;
        }
    }
}
