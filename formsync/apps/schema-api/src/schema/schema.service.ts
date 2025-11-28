/**
 * Schema Service
 * 
 * Business logic for schema operations:
 * - Format conversion using parser plugins
 * - Schema validation using validator plugins
 * - AI enhancement using LLM provider plugins
 * - CRUD operations with Prisma
 * - Caching with Redis
 */

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PluginRegistry } from '@formsync/plugins';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ConvertSchemaDto,
  EnhanceSchemaDto,
  ValidateSchemaDto,
  CreateSchemaDto,
  UpdateSchemaDto,
} from './dto/schema.dto';

@Injectable()
export class SchemaService {
  constructor(
    @Inject('PLUGIN_REGISTRY') private readonly pluginRegistry: PluginRegistry,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  /**
   * POST /schema/convert
   * Auto-detect format and convert to JSON Schema Draft-7
   */
  async convertSchema(dto: ConvertSchemaDto) {
    // Check cache first
    const cacheKey = `convert:${Buffer.from(dto.input).toString('base64').slice(0, 32)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    let parser;

    if (dto.format) {
      // Use specified parser
      console.log('[SchemaService] Looking for parser for format:', dto.format);
      parser = this.pluginRegistry
        .getAllParsers()
        .find((p) => p.getSupportedFormats().includes(dto.format));
      console.log('[SchemaService] Found parser:', parser?.name);
    } else {
      // Auto-detect
      console.log('[SchemaService] Auto-detecting format');
      parser = this.pluginRegistry.detectParser(dto.input);
      console.log('[SchemaService] Detected parser:', parser?.name);
    }

    if (!parser) {
      throw new BadRequestException('Could not detect format or find suitable parser');
    }

    console.log('[SchemaService] Using parser:', parser.name);
    const result = await parser.parse(dto.input);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Parsing failed',
        errors: result.errors,
      });
    }

    const response = {
      schema: result.schema,
      detectedFormat: result.detectedFormat,
      parserUsed: parser.name,
    };

    // Cache the result
    await this.redis.set(cacheKey, response);

    return response;
  }

  /**
   * POST /schema/enhance
   * Use AI to enhance schema
   */
  async enhanceSchema(dto: EnhanceSchemaDto) {
    const providerName = dto.provider || 'openai-llm';
    const provider = this.pluginRegistry.getLLMProvider(providerName);

    if (!provider) {
      throw new NotFoundException(`LLM provider "${providerName}" not found`);
    }

    if (!provider.isConfigured()) {
      throw new BadRequestException(`LLM provider "${providerName}" is not configured`);
    }

    const result = await provider.enhanceSchema(dto.schema, {
      focusAreas: dto.focusAreas,
      preserveStructure: dto.preserveStructure,
    });

    if (!result.success) {
      throw new BadRequestException({
        message: 'AI enhancement failed',
        errors: result.errors,
      });
    }

    return {
      enhancedSchema: result.enhancedSchema,
      changes: result.changes,
      tokensUsed: result.tokensUsed,
      model: result.model,
      provider: provider.getProviderName(),
    };
  }

  /**
   * POST /schema/validate
   * Run all or specific validators
   */
  async validateSchema(dto: ValidateSchemaDto) {
    const validators = dto.validators
      ? dto.validators.map((name) => this.pluginRegistry.getValidator(name)).filter(Boolean)
      : this.pluginRegistry.getAllValidators();

    if (validators.length === 0) {
      throw new BadRequestException('No validators found');
    }

    const results = await Promise.all(
      validators.map((validator) => validator!.validate(dto.schema))
    );

    const allIssues = results.flatMap((r) => r.issues);
    const errorCount = allIssues.filter((i) => i.severity === 'error').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;

    return {
      valid: errorCount === 0,
      results,
      summary: {
        validators: results.length,
        errors: errorCount,
        warnings: warningCount,
        info: allIssues.filter((i) => i.severity === 'info').length,
      },
    };
  }

  /**
   * POST /schema
   * Create new schema
   */
  async createSchema(dto: CreateSchemaDto) {
    const schema = await this.prisma.schema.create({
      data: {
        name: dto.name,
        description: dto.description,
        content: dto.content,
        sourceFormat: dto.sourceFormat || 'json',
        tags: dto.tags || [],
        status: dto.status || 'draft',
        userId: dto.userId,
        version: 1,
      },
      include: {
        user: true,
      },
    });

    // Create initial version
    await this.prisma.schemaVersion.create({
      data: {
        schemaId: schema.id,
        version: 1,
        content: dto.content,
        changeLog: 'Initial version',
      },
    });

    return schema;
  }

  /**
   * GET /schema/:id
   * Get schema by ID
   */
  async getSchema(id: string) {
    const schema = await this.prisma.schema.findUnique({
      where: { id },
      include: {
        user: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
      },
    });

    if (!schema) {
      throw new NotFoundException(`Schema with ID "${id}" not found`);
    }

    return schema;
  }

  /**
   * GET /schema
   * List all schemas with filters
   */
  async listSchemas(userId?: string, status?: string, tags?: string[]) {
    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    return this.prisma.schema.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * PUT /schema/:id
   * Update schema (creates new version)
   */
  async updateSchema(id: string, dto: UpdateSchemaDto) {
    const existing = await this.prisma.schema.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Schema with ID "${id}" not found`);
    }

    const newVersion = existing.version + 1;
    const content = dto.content || existing.content;

    const updated = await this.prisma.schema.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        content,
        tags: dto.tags,
        status: dto.status,
        version: newVersion,
      },
      include: {
        user: true,
      },
    });

    // Create version record
    await this.prisma.schemaVersion.create({
      data: {
        schemaId: id,
        version: newVersion,
        content,
        changeLog: dto.changeLog || `Updated to version ${newVersion}`,
      },
    });

    return updated;
  }

  /**
   * DELETE /schema/:id
   * Delete schema
   */
  async deleteSchema(id: string) {
    const existing = await this.prisma.schema.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Schema with ID "${id}" not found`);
    }

    await this.prisma.schema.delete({ where: { id } });

    return { message: 'Schema deleted successfully' };
  }
}
