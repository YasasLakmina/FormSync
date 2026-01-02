import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { GenerateRequestDto } from './dto/generate-request.dto';
import { LocalPluginRegistry } from '../plugins/local-plugin-registry';
import { ZipGeneratorService } from './services/zip-generator.service';
import { FormSyncSchemaConverter } from './services/formsync-schema-converter.service';

/**
 * RuntimeBindingValidatorController
 * 
 * REST API controller for generating Spring Boot projects.
 * Provides endpoint to generate and download complete projects as ZIP files.
 */
@Controller('api/runtime-binding-validator')
export class RuntimeBindingValidatorController {
  constructor(
    @Inject('PLUGIN_REGISTRY') private readonly registry: LocalPluginRegistry,
    private readonly zipGenerator: ZipGeneratorService,
    private readonly formSyncConverter: FormSyncSchemaConverter
  ) {}

  /**
   * Generate Spring Boot project from XML, JSON schema, or FormSync schema
   * 
   * POST /api/runtime-binding-validator/generate
   */
  @Post('generate')
  async generateProject(
    @Body() request: GenerateRequestDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      // Validate input - at least one format must be provided
      if (!request.xmlInput && !request.jsonSchema && !request.formSyncSchema) {
        throw new HttpException(
          'Either xmlInput, jsonSchema, or formSyncSchema must be provided',
          HttpStatus.BAD_REQUEST
        );
      }

      let schema = request.jsonSchema;
      let packageName = request.packageName;
      let projectName = request.projectName;

      // Handle FormSync JSON schema format (new, recommended format)
      if (request.formSyncSchema && !schema) {
        schema = this.formSyncConverter.convertToJsonSchema(request.formSyncSchema);
        
        // Extract backend config from FormSync schema
        const backendConfig = this.formSyncConverter.extractBackendConfig(request.formSyncSchema);
        packageName = packageName || backendConfig.packageName;
        projectName = projectName || backendConfig.projectName;
      }

      // Parse XML if provided (legacy format)
      if (request.xmlInput && !schema) {
        const parser = this.registry.detectParser(request.xmlInput);
        if (!parser) {
          throw new HttpException(
            'Unable to parse XML input',
            HttpStatus.BAD_REQUEST
          );
        }

        const parseResult = await parser.parse(request.xmlInput);
        if (!parseResult.success || !parseResult.schema) {
          throw new HttpException(
            `XML parsing failed: ${parseResult.errors?.join(', ')}`,
            HttpStatus.BAD_REQUEST
          );
        }

        schema = parseResult.schema;
      }

      // Get Spring Boot generator plugin
      const generator = this.registry.getRuntimeGenerator('springboot-generator');
      if (!generator) {
        throw new HttpException(
          'Spring Boot generator plugin not found',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Generate project files
      const generateResult = await generator.generate(schema, {
        projectName: projectName,
        packageName: packageName,
      });

      if (!generateResult.success || !generateResult.files) {
        throw new HttpException(
          `Generation failed: ${generateResult.errors?.join(', ')}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Convert GeneratedFile[] to FileToZip[]
      const filesToZip = generateResult.files.map((file) => ({
        path: file.path,
        content: file.content,
      }));

      // Determine final project name
      const finalProjectName =
        projectName ||
        schema.title?.replace(/\s+/g, '-') ||
        'generated-project';

      // Create ZIP file
      const zipBuffer = await this.zipGenerator.generateZip(
        filesToZip,
        finalProjectName
      );

      // Send ZIP file as response
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${finalProjectName}.zip"`
      );
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error generating project:', error);
      throw new HttpException(
        'Internal server error during project generation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
