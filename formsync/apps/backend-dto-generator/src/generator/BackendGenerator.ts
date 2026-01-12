
import { BackendGeneratorPlugin, BasePlugin, BackendGeneratorConfig } from '@formsync/plugins';
import { SchemaApiClient } from '../client/SchemaApiClient';
import { SchemaMapper } from '../mapper/SchemaMapper';
import { InternalSchema } from '../model/InternalModel';
import { TemplateService } from '../service/TemplateService';
import { FileWriter } from '../service/FileWriter';
import * as path from 'path';

export class BackendGenerator extends BasePlugin implements BackendGeneratorPlugin {
    private mapper: SchemaMapper;
    private templateService: TemplateService;
    private fileWriter: FileWriter;

    constructor() {
        super();
        this.mapper = new SchemaMapper();
        this.templateService = new TemplateService();
        this.fileWriter = new FileWriter();

    }

    async generate(schema: any, config?: BackendGeneratorConfig): Promise<void> {

        // Default config values
        const outputDir = config?.outputDir || './generated-output';
        const basePackage = config?.basePackage || 'com.example.demo';
        const packagePath = basePackage.replace(/\./g, '/');

        try {
            let internalModel: InternalSchema;

            // Map input to InternalModel
            if (schema.content && (schema.name || schema.id)) {
                internalModel = this.mapper.map(schema);
            } else {
                internalModel = this.mapper.map({
                    name: 'ExampleApp',
                    content: schema
                });
            }


            // 1. Generate POM
            const pomContent = this.templateService.render('pom', {
                name: internalModel.entities[0]?.name || 'demo',
                version: internalModel.version,
                basePackage
            });
            this.fileWriter.write(path.join(outputDir, 'pom.xml'), pomContent);

            // 2. Generate Enums
            for (const enumDef of internalModel.enums) {
                const enumContent = this.templateService.render('enum', {
                    ...enumDef,
                    basePackage
                });
                this.fileWriter.write(path.join(outputDir, 'src/main/java', packagePath, 'model', `${enumDef.name}.java`), enumContent);
            }

            // 3. Generate Java Classes for each Entity
            for (const entity of internalModel.entities) {
                const context = { ...entity, basePackage };

                // Entity
                const entityContent = this.templateService.render('entity', context);
                this.fileWriter.write(path.join(outputDir, 'src/main/java', packagePath, 'model', `${entity.name}.java`), entityContent);

                // Only generate Controller/Service/Repo for Root entities
                if (entity.isRoot) {
                    // Repository
                    const repoContent = this.templateService.render('repository', context);
                    this.fileWriter.write(path.join(outputDir, 'src/main/java', packagePath, 'repository', `${entity.name}Repository.java`), repoContent);

                    // Service
                    const serviceContent = this.templateService.render('service', context);
                    this.fileWriter.write(path.join(outputDir, 'src/main/java', packagePath, 'service', `${entity.name}Service.java`), serviceContent);

                    // Controller
                    const controllerContent = this.templateService.render('controller', context);
                    this.fileWriter.write(path.join(outputDir, 'src/main/java', packagePath, 'controller', `${entity.name}Controller.java`), controllerContent);
                }
            }

        } catch (error: any) {
            console.error('Error during generation:', error);
            throw error;
        }

        console.log(`BackendGenerator: Generation complete. Output at ${outputDir}`);
    }
}
