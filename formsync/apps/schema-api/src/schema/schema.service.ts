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
import { SchemaSuggestionEngine } from './schema-suggestion.engine';
import { SchemaSyntaxValidator } from './schema-syntax-validator';
import {
  ConvertSchemaDto,
  EnhanceSchemaDto,
  ValidateSchemaDto,
  CreateSchemaDto,
  UpdateSchemaDto,
  ApplySuggestionDto,
  RecalculateQualityDto,
  SuggestNameDto,
} from './dto/schema.dto';

@Injectable()
export class SchemaService {
  constructor(
    @Inject('PLUGIN_REGISTRY') private readonly pluginRegistry: PluginRegistry,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly qualityEngine: SchemaQualityEngine,
    private readonly enhancerService: SchemaEnhancerService,
    private readonly syntaxValidator: SchemaSyntaxValidator
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
   * POST /schema/suggest-name
   * Suggest schema name using pattern matching
   */
  async suggestSchemaName(dto: SuggestNameDto) {
    try {
      // Extract field names from DTO for pattern matching
      let fields: string[] = [];
      let schemaTitle: string | undefined;
      
      if (dto.fields && dto.fields.length > 0) {
        fields = dto.fields;
      } else if (dto.schemaContent) {
        try {
          const parsed = typeof dto.schemaContent === 'string' 
            ? JSON.parse(dto.schemaContent) 
            : dto.schemaContent;
          if (parsed.properties) {
            fields = Object.keys(parsed.properties);
          }
          // Check if schema already has a meaningful title
          if (parsed.title && parsed.title !== 'Generated Schema') {
            schemaTitle = parsed.title;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // If schema already has a title, use it
      if (schemaTitle) {
        return {
          suggestedName: schemaTitle,
          confidence: 'high',
        };
      }

      if (!fields || fields.length === 0) {
        // No fields and no title - return generic name
        return {
          suggestedName: 'Generated Schema',
          confidence: 'low',
        };
      }

      // Fallback: Pattern-based name generation
      const suggestedName = this.generateNameFromFields(fields);

      console.log('[SchemaService] Suggested name:', suggestedName, 'from fields:', fields);

      return {
        suggestedName,
        confidence: 'medium',
      };
    } catch (error) {
      console.error('[SchemaService] Failed to suggest name:', error);
      
      // Fallback to generic name
      return {
        suggestedName: 'Generated Schema',
        confidence: 'low',
      };
    }
  }

  /**
   * Helper: Generate a contextual name from field names
   */
  private generateNameFromFields(fields: string[]): string {
    // Common patterns and their schema names
    const patterns = [
      { keywords: ['user', 'username', 'password', 'email'], name: 'User Registration' },
      { keywords: ['login', 'username', 'password'], name: 'Login Form' },
      { keywords: ['contact', 'phone', 'email', 'message'], name: 'Contact Form' },
      { keywords: ['address', 'street', 'city', 'zip', 'state'], name: 'Address Information' },
      { keywords: ['payment', 'card', 'billing'], name: 'Payment Information' },
      { keywords: ['profile', 'bio', 'avatar'], name: 'User Profile' },
      { keywords: ['order', 'product', 'quantity', 'price'], name: 'Order Form' },
      { keywords: ['feedback', 'rating', 'comment'], name: 'Feedback Form' },
      { keywords: ['survey', 'question', 'answer'], name: 'Survey Form' },
    ];

    // Convert fields to lowercase for matching
    const lowerFields = fields.map(f => f.toLowerCase());
    
    // Find best matching pattern
    for (const pattern of patterns) {
      const matchCount = pattern.keywords.filter(kw => 
        lowerFields.some(f => f.includes(kw))
      ).length;
      
      // If at least 2 keywords match, use this pattern
      if (matchCount >= 2) {
        return pattern.name;
      }
    }

    // No pattern matched - generate from first field
    const primaryField = fields[0];
    const formatted = primaryField
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return `${formatted} Form`;
  }

  /**
   * POST /schema/validate-syntax
   * Validate syntax ONLY without converting
   * (NEW method for frontend validation button)
   */
  async validateSyntaxOnly(dto: ConvertSchemaDto) {
    // Perform strict syntax validation (no conversion)
    const syntaxValidation = this.syntaxValidator.validateSyntax(dto.input, dto.format);
    
    if (!syntaxValidation.valid) {
      // Return validation errors (don't throw, return structured response)
      throw new BadRequestException({
        message: 'Syntax validation failed',
        syntaxErrors: syntaxValidation.syntaxErrors,
        formatMismatch: syntaxValidation.formatMismatch,
        syntaxSuggestions: syntaxValidation.syntaxSuggestions,
      });
    }
    
    // Syntax is valid - return success
    return {
      valid: true,
      message: `Valid ${(dto.format || 'detected').toUpperCase()} syntax`,
    };
  }

  /**
  * POST /schema/quick-fix
   * Attempt to automatically fix syntax errors
   * (Enhanced with AI fallback)
   */
  async quickFixSyntax(dto: ConvertSchemaDto) {
    // Validate the format
    const format = dto.format || 'json';
    
    // Attempt quick fix (now async with AI fallback)
    const result = await this.syntaxValidator.attemptQuickFix(dto.input, format as any);
    
    if (!result.success) {
      throw new BadRequestException({
        message: result.message,
        suggestion: 'Please fix the errors manually or use a more advanced fix option',
      });
    }
    
    // Return the fixed input with confidence indicator
    return {
      success: true,
      fixedInput: result.fixedInput,
      confidence: result.confidence,
      message: result.message,
    };
  }

  /**
   * POST /schema/convert
   * Auto-detect format and convert to JSON Schema Draft-7
   * 
   * ENHANCED: Performs STRICT SYNTAX VALIDATION before any processing
   */
  async convertSchema(dto: ConvertSchemaDto) {
    // STEP 1: STRICT SYNTAX VALIDATION (NEW)
    // Validate syntax BEFORE any other processing
    const syntaxValidation = this.syntaxValidator.validateSyntax(dto.input, dto.format);
    
    if (!syntaxValidation.valid) {
      // STOP processing on syntax errors
      throw new BadRequestException({
        message: 'Syntax validation failed',
        syntaxErrors: syntaxValidation.syntaxErrors,
        formatMismatch: syntaxValidation.formatMismatch,
        syntaxSuggestions: syntaxValidation.syntaxSuggestions,
      });
    }
    
    // STEP 2: Check cache (only if syntax is valid)
    const crypto = await import('crypto');
    const inputHash = crypto.createHash('sha256').update(dto.input).digest('hex');
    const cacheKey = `v2:convert:${dto.format || 'auto'}:${inputHash}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // STEP 3: Proceed with parsing (syntax is valid)
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
