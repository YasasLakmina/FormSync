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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SchemaService } from './schema.service';
import { ImportService } from './import.service';
import {
  ConvertSchemaDto,
  EnhanceSchemaDto,
  ValidateSchemaDto,
  CreateSchemaDto,
  UpdateSchemaDto,
} from './dto/schema.dto';

@ApiTags('schema')
@Controller('schema')
export class SchemaController {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly importService: ImportService
  ) {}

  @Post('convert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert input to JSON Schema Draft-7', tags: ['conversion'] })
  @ApiResponse({ status: 200, description: 'Schema converted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or parsing failed' })
  async convert(@Body() dto: ConvertSchemaDto) {
    return this.schemaService.convertSchema(dto);
  }

  @Post('enhance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enhance schema using AI', tags: ['ai'] })
  @ApiResponse({ status: 200, description: 'Schema enhanced successfully' })
  @ApiResponse({ status: 400, description: 'Enhancement failed' })
  @ApiResponse({ status: 404, description: 'LLM provider not found' })
  async enhance(@Body() dto: EnhanceSchemaDto) {
    return this.schemaService.enhanceSchema(dto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate schema against rules', tags: ['validation'] })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  @ApiResponse({ status: 400, description: 'No validators found' })
  async validate(@Body() dto: ValidateSchemaDto) {
    return this.schemaService.validateSchema(dto);
  }

  @Post('import-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import schema from URL', tags: ['import'] })
  @ApiResponse({ status: 200, description: 'Schema imported successfully' })
  @ApiResponse({ status: 400, description: 'Failed to fetch or parse schema' })
  async importFromUrl(@Body() body: { url: string; format?: 'json' | 'yaml' | 'xml' }) {
    return this.importService.importFromUrl(body.url, body.format);
  }

  @Post()
  @ApiOperation({ summary: 'Create new schema' })
  @ApiResponse({ status: 201, description: 'Schema created successfully' })
  async create(@Body() dto: CreateSchemaDto) {
    return this.schemaService.createSchema(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schema by ID' })
  @ApiResponse({ status: 200, description: 'Schema found' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  async getById(@Param('id') id: string) {
    return this.schemaService.getSchema(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all schemas with optional filters' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiResponse({ status: 200, description: 'Schemas retrieved successfully' })
  async list(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string
  ) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.schemaService.listSchemas(userId, status, tagArray);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update schema (creates new version)' })
  @ApiResponse({ status: 200, description: 'Schema updated successfully' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSchemaDto) {
    return this.schemaService.updateSchema(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schema' })
  @ApiResponse({ status: 200, description: 'Schema deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  async delete(@Param('id') id: string) {
    return this.schemaService.deleteSchema(id);
  }
}
