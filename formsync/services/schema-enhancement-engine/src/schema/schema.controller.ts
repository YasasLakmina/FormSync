/**
 * Schema Controller
 *
 * REST API endpoints for schema operations
 *
 * Endpoints:
 * - POST /schema/convert - Convert format to JSON Schema
 * - POST /schema/enhance - AI enhancement
 * - POST /schema/validate - Validate schema
 * - POST /schema - Create schema
 * - GET /schema/:id - Get schema
 * - GET /schema - List schemas
 * - PUT /schema/:id - Update schema
 * - DELETE /schema/:id - Delete schema
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { SchemaService } from "./schema.service";
import { ImportService } from "./import.service";
import {
  ConvertSchemaDto,
  EnhanceSchemaDto,
  ValidateSchemaDto,
  CreateSchemaDto,
  UpdateSchemaDto,
  ApplySuggestionDto,
  RecalculateQualityDto,
  SuggestNameDto,
} from "./dto/schema.dto";

@ApiTags("schema")
@Controller("schema")
export class SchemaController {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly importService: ImportService,
  ) {}

  @Post("convert")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Convert input to JSON Schema Draft-7",
    tags: ["conversion"],
  })
  @ApiResponse({ status: 200, description: "Schema converted successfully" })
  @ApiResponse({ status: 400, description: "Invalid input or parsing failed" })
  async convert(@Body() dto: ConvertSchemaDto) {
    return this.schemaService.convertSchema(dto);
  }

  /**
   * POST /schema/validate-syntax
   * Validate syntax without converting (validation only)
   */
  @Post("validate-syntax")
  async validateSyntax(@Body() dto: ConvertSchemaDto) {
    return this.schemaService.validateSyntaxOnly(dto);
  }

  /**
   * POST /schema/quick-fix
   * Attempt to automatically fix syntax errors
   */
  @Post("quick-fix")
  async quickFix(@Body() dto: ConvertSchemaDto) {
    return this.schemaService.quickFixSyntax(dto);
  }

  /**
   * POST /schema/enhance
   * Use AI to enhance schema with quality scoring
   */
  @Post("enhance")
  async enhance(@Body() dto: EnhanceSchemaDto) {
    return this.schemaService.enhanceSchema(dto);
  }

  /**
   * POST /schema/suggest-name
   * Use AI to suggest a schema name based on fields or content
   */
  @Post("suggest-name")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Suggest schema name using AI", tags: ["ai"] })
  @ApiResponse({ status: 200, description: "Name suggested successfully" })
  async suggestName(@Body() dto: SuggestNameDto) {
    return this.schemaService.suggestSchemaName(dto);
  }

  /**
   * POST /schema/validate
   * Validate schema using validators
   */
  @Post("validate")
  async validate(@Body() dto: ValidateSchemaDto) {
    return this.schemaService.validateSchema(dto);
  }

  @Post("import-url")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Import schema from URL", tags: ["import"] })
  @ApiResponse({ status: 200, description: "Schema imported successfully" })
  @ApiResponse({ status: 400, description: "Failed to fetch or parse schema" })
  async importFromUrl(
    @Body() body: { url: string; format?: "json" | "yaml" | "xml" },
  ) {
    return this.importService.importFromUrl(body.url, body.format);
  }

  @Post()
  @ApiOperation({ summary: "Create new schema" })
  @ApiResponse({ status: 201, description: "Schema created successfully" })
  async create(@Body() dto: CreateSchemaDto) {
    return this.schemaService.createSchema(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get schema by ID" })
  @ApiResponse({ status: 200, description: "Schema found" })
  @ApiResponse({ status: 404, description: "Schema not found" })
  async getById(@Param("id") id: string) {
    return this.schemaService.getSchema(id);
  }

  @Get()
  @ApiOperation({ summary: "List all schemas with optional filters" })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
  })
  @ApiQuery({
    name: "tags",
    required: false,
    description: "Filter by tags (comma-separated)",
  })
  @ApiResponse({ status: 200, description: "Schemas retrieved successfully" })
  async list(
    @Query("userId") userId?: string,
    @Query("status") status?: string,
    @Query("tags") tags?: string,
  ) {
    const tagArray = tags ? tags.split(",") : undefined;
    return this.schemaService.listSchemas(userId, status, tagArray);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update schema (creates new version)" })
  @ApiResponse({ status: 200, description: "Schema updated successfully" })
  @ApiResponse({ status: 404, description: "Schema not found" })
  async update(@Param("id") id: string, @Body() dto: UpdateSchemaDto) {
    return this.schemaService.updateSchema(id, dto);
  }

  @Delete("cache")
  @ApiOperation({
    summary: "Clear all cached conversion results",
    tags: ["cache"],
  })
  @ApiResponse({ status: 200, description: "Cache cleared successfully" })
  async clearCache() {
    return this.schemaService.clearCache();
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete schema" })
  @ApiResponse({ status: 200, description: "Schema deleted successfully" })
  @ApiResponse({ status: 404, description: "Schema not found" })
  async delete(@Param("id") id: string) {
    return this.schemaService.deleteSchema(id);
  }

  @Post("suggestion/apply")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Apply or undo a suggestion and recalculate quality score",
    tags: ["ai", "suggestions"],
  })
  @ApiResponse({
    status: 200,
    description:
      "Suggestion applied/undone successfully with updated quality score",
  })
  @ApiResponse({ status: 400, description: "Invalid suggestion or action" })
  async applySuggestion(@Body() dto: ApplySuggestionDto) {
    return this.schemaService.applySuggestion(dto);
  }

  @Post("quality/recalculate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Recalculate quality score for current schema state",
    tags: ["ai", "quality"],
  })
  @ApiResponse({
    status: 200,
    description: "Quality score recalculated successfully",
  })
  async recalculateQuality(@Body() dto: RecalculateQualityDto) {
    return this.schemaService.recalculateQuality(dto);
  }

  @Get("../health")
  @ApiOperation({ summary: "Health check endpoint", tags: ["health"] })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  async healthCheck() {
    return {
      status: "ok",
      service: "schema-enhancement-engine",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
