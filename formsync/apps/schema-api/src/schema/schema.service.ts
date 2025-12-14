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
import { SchemaQualityEngine } from './schema-quality-engine';
import { SchemaEnhancerService } from './schema-enhancer.service';
import {
  ConvertSchemaDto,
  EnhanceSchemaDto,
  ValidateSchemaDto,
  CreateSchemaDto,
  UpdateSchemaDto,
  ApplySuggestionDto,
  RecalculateQualityDto,
} from './dto/schema.dto';

@Injectable()
export class SchemaService {
  constructor(
    @Inject('PLUGIN_REGISTRY') private readonly pluginRegistry: PluginRegistry,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly qualityEngine: SchemaQualityEngine,
    private readonly enhancerService: SchemaEnhancerService
  ) {}

  /**
   * POST /schema/enhance
   * Use AI to enhance schema with comprehensive quality scoring
   * (UPDATED for suggestion-driven model)
   */
  async enhanceSchema(dto: EnhanceSchemaDto) {
    // Use the SchemaEnhancerService which handles the new suggestion-driven workflow
    const result = await this.enhancerService.enhanceSchema(dto.schema, {
      focusAreas: dto.focusAreas,
      preserveStructure: dto.preserveStructure,
    });

    return {
      // Base enhanced schema (with safe auto-fixes ONLY)
      enhancedSchema: result.enhancedSchema,

      // Auto-applied safe changes
      changes: result.changes,

      // NEW: AI suggestions (NOT auto-applied)
      suggestions: result.suggestions,

      // Quality metrics for CURRENT state (before suggestions)
      qualityScore: result.quality.score,
      qualityBreakdown: result.quality.breakdown,
      issues: result.quality.issues,

      // Metadata
      model: result.model,
      tokensUsed: result.tokensUsed,

      // Statistics
      metrics: {
        totalChanges: result.changes.length,
        totalSuggestions: result.suggestions.length,
        appliedSuggestions: 0, // None applied yet
        accessibilityCoverage: this.calculateAccessibilityCoverage(result.enhancedSchema),
      },
    };
  }

  /**
   * POST /schema/suggestion/apply
   * Apply or undo a suggestion and get updated quality score
   * (NEW for suggestion-driven model)
   */
  async applySuggestion(dto: ApplySuggestionDto) {
    // Validate required fields
    if (!dto.baseSchema) {
      throw new Error('baseSchema is required');
    }
    if (!dto.suggestion) {
      throw new Error('suggestion is required');
    }
    if (!dto.allSuggestions || !Array.isArray(dto.allSuggestions)) {
      throw new Error('allSuggestions must be an array');
    }
    if (!dto.aiChanges || !Array.isArray(dto.aiChanges)) {
      throw new Error('aiChanges must be an array');
    }

    const result = this.enhancerService.applySuggestion(
      dto.baseSchema,
      dto.suggestion,
      dto.allSuggestions,
      dto.aiChanges,
      dto.action
    );

    return {
      // Updated schema state
      schema: result.schema,

      // Updated suggestion (with toggled applied flag)
      suggestion: result.suggestion,

      // Recalculated quality metrics
      qualityScore: result.quality.score,
      qualityBreakdown: result.quality.breakdown,
      issues: result.quality.issues,

      // Score change
      scoreDelta: result.scoreDelta,

      // Context
      action: dto.action,

      // Statistics
      metrics: {
        appliedSuggestions: dto.allSuggestions.filter((s) =>
          s.id === dto.suggestion.id ? result.suggestion.applied : s.applied
        ).length,
        totalSuggestions: dto.allSuggestions.length,
      },
    };
  }

  /**
   * POST /schema/quality/recalculate
   * Recalculate quality score for current state
   * (NEW for suggestion-driven model)
   */
  async recalculateQuality(dto: RecalculateQualityDto) {
    const quality = this.enhancerService.recalculateQuality(
      dto.baseSchema,
      dto.allSuggestions,
      dto.aiChanges
    );

    return {
      qualityScore: quality.score,
      qualityBreakdown: quality.breakdown,
      issues: quality.issues,
      appliedSuggestionsCount: quality.appliedSuggestionsCount,
      totalSuggestionsCount: quality.totalSuggestionsCount,
    };
  }

  /**
   * Helper: Calculate accessibility coverage for backward compatibility
   */
  private calculateAccessibilityCoverage(schema: any): number {
    let total = 0;
    let covered = 0;

    const walk = (obj: any) => {
      if (!obj?.properties) return;
      for (const prop of Object.values(obj.properties)) {
        total++;
        if ((prop as any)['x-accessibility']) covered++;
        if ((prop as any).type === 'object') walk(prop);
      }
    };

    walk(schema);
    return total === 0 ? 1 : covered / total;
  }

  /**
   * POST /schema/convert
   * Auto-detect format and convert to JSON Schema Draft-7
   */
  async convertSchema(dto: ConvertSchemaDto) {
    // Check cache first (v2 cache for normalized schemas)
    // Use crypto hash to avoid collisions from truncated keys
    const crypto = await import('crypto');
    const inputHash = crypto.createHash('sha256').update(dto.input).digest('hex');
    const cacheKey = `v2:convert:${dto.format || 'auto'}:${inputHash}`;

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
      console.error('[SchemaService] Parsing failed:', result.errors);
      console.error('[SchemaService] Input was:', dto.input.substring(0, 200));
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
