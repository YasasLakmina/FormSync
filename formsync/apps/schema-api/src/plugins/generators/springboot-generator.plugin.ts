import { Injectable } from '@nestjs/common';
import {
  RuntimeGeneratorPlugin,
  GeneratorOptions,
  GenerateResult,
  GeneratedFile,
} from '@formsync/plugins';
import { SpringBootScaffoldService } from '../../runtime-binding-validator/services/springboot-scaffold.service';
import { DtoGeneratorService } from '../../runtime-binding-validator/services/dto-generator.service';
import { ControllerGeneratorService } from '../../runtime-binding-validator/services/controller-generator.service';

/**
 * SpringBootGeneratorPlugin
 * 
 * Runtime generator plugin that creates complete Spring Boot projects
 * with REST controllers, DTOs, and validation from JSON Schema.
 */
@Injectable()
export class SpringBootGeneratorPlugin implements RuntimeGeneratorPlugin {
  readonly name = 'springboot-generator';

  constructor(
    private readonly scaffoldService: SpringBootScaffoldService,
    private readonly dtoGenerator: DtoGeneratorService,
    private readonly controllerGenerator: ControllerGeneratorService
  ) {}

  /**
   * Generate Spring Boot project from JSON Schema
   */
  async generate(schema: any, options?: GeneratorOptions): Promise<GenerateResult> {
    try {
      // Extract project configuration
      const projectName = options?.projectName || schema.title || 'GeneratedProject';
      const packageName = options?.packageName || 'com.formsync.generated';
      const resourceName = this.extractResourceName(schema);
      const className = this.sanitizeClassName(resourceName);

      // Generate all project files
      const files: GeneratedFile[] = [];

      // 1. Main Application Class
      const mainClass = this.scaffoldService.generateMainClass(packageName, className);
      files.push({
        path: `src/main/java/${packageName.replace(/\./g, '/')}/${className}Application.java`,
        content: mainClass,
      });

      // 2. DTO
      const dto = this.dtoGenerator.generateDto(schema, className, packageName);
      files.push({
        path: `src/main/java/${packageName.replace(/\./g, '/')}/dto/${className}Dto.java`,
        content: dto,
      });

      // 3. Controller
      const controller = this.controllerGenerator.generateController(
        resourceName,
        className,
        packageName
      );
      files.push({
        path: `src/main/java/${packageName.replace(/\./g, '/')}/controller/${resourceName}Controller.java`,
        content: controller,
      });

      // 4. application.properties
      const appProperties = this.scaffoldService.generateApplicationProperties(projectName);
      files.push({
        path: 'src/main/resources/application.properties',
        content: appProperties,
      });

      // 5. pom.xml
      const groupId = packageName.split('.').slice(0, 2).join('.');
      const artifactId = projectName.toLowerCase().replace(/\s+/g, '-');
      const pomXml = this.scaffoldService.generatePomXml(groupId, artifactId, projectName);
      files.push({
        path: 'pom.xml',
        content: pomXml,
      });

      // 6. README.md
      const readme = this.scaffoldService.generateReadme(projectName, resourceName);
      files.push({
        path: 'README.md',
        content: readme,
      });

      // 7. .gitignore
      const gitignore = this.scaffoldService.generateGitignore();
      files.push({
        path: '.gitignore',
        content: gitignore,
      });

      return {
        success: true,
        files,
        metadata: {
          framework: 'Spring Boot',
          language: 'Java',
          buildTool: 'Maven',
          entryPoint: `${className}Application.java`,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error during generation'],
      };
    }
  }

  /**
   * Get supported target frameworks
   */
  getSupportedTargets(): string[] {
    return ['spring-boot', 'java', 'rest-api'];
  }

  /**
   * Get plugin description
   */
  getDescription(): string {
    return 'Generates complete Spring Boot REST API projects with validation from JSON Schema';
  }

  /**
   * Extract resource name from schema
   */
  private extractResourceName(schema: any): string {
    // Try to get from title
    if (schema.title) {
      // Remove common suffixes like "Form", "Schema"
      return schema.title
        .replace(/\s*(Form|Schema|Registration)\s*$/i, '')
        .replace(/\s+/g, '');
    }
    return 'Resource';
  }

  /**
   * Sanitize class name (remove special characters, ensure PascalCase)
   */
  private sanitizeClassName(name: string): string {
    // Remove special characters
    const cleaned = name.replace(/[^a-zA-Z0-9]/g, '');
    // Ensure PascalCase
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}
