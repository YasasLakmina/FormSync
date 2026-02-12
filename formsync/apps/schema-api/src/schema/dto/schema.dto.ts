/**
 * Schema DTOs (Data Transfer Objects)
 *
 * Validation and type definitions for schema-related requests
 */

import { IsString, IsOptional, IsArray, IsObject, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ===== Convert Schema DTO =====
export class ConvertSchemaDto {
  @ApiProperty({ description: 'Raw schema input (JSON/YAML/XML)' })
  @IsString()
  input: string;

  @ApiPropertyOptional({ description: 'Force specific format (auto-detect if not provided)' })
  @IsOptional()
  @IsEnum(['json', 'yaml', 'xml'])
  format?: 'json' | 'yaml' | 'xml';
}

// ===== Enhance Schema DTO =====
export class EnhanceSchemaDto {
  @ApiProperty({ description: 'JSON Schema to enhance' })
  @IsObject()
  schema: any;

  @ApiPropertyOptional({ description: 'Focus areas for enhancement' })
  @IsOptional()
  @IsArray()
  @IsEnum(['naming', 'validation', 'accessibility', 'descriptions'], { each: true })
  focusAreas?: ('naming' | 'validation' | 'accessibility' | 'descriptions')[];

  @ApiPropertyOptional({ description: 'Preserve structure (no field additions/removals)' })
  @IsOptional()
  @IsBoolean()
  preserveStructure?: boolean;

  @ApiPropertyOptional({ description: 'LLM provider to use' })
  @IsOptional()
  @IsString()
  provider?: string;
}

// ===== Validate Schema DTO =====
export class ValidateSchemaDto {
  @ApiProperty({ description: 'JSON Schema to validate' })
  @IsObject()
  schema: any;

  @ApiPropertyOptional({ description: 'Specific validators to run (all if not provided)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validators?: string[];
}

// ===== Create Schema DTO =====
export class CreateSchemaDto {
  @ApiProperty({ description: 'Schema name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Schema description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'JSON Schema content' })
  @IsObject()
  content: any;

  @ApiPropertyOptional({ description: 'Source format (json/yaml/xml)' })
  @IsOptional()
  @IsString()
  sourceFormat?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'User ID (owner)' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Schema status' })
  @IsOptional()
  @IsEnum(['draft', 'validated', 'enhanced', 'published'])
  status?: 'draft' | 'validated' | 'enhanced' | 'published';
}

// ===== Update Schema DTO =====
export class UpdateSchemaDto {
  @ApiPropertyOptional({ description: 'Schema name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Schema description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'JSON Schema content' })
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Schema status' })
  @IsOptional()
  @IsEnum(['draft', 'validated', 'enhanced', 'published'])
  status?: 'draft' | 'validated' | 'enhanced' | 'published';

  @ApiPropertyOptional({ description: 'Change log for this version' })
  @IsOptional()
  @IsString()
  changeLog?: string;
}

// ===== Apply/Undo Suggestion DTO =====
export class ApplySuggestionDto {
  @ApiProperty({ description: 'Base enhanced schema (before suggestions)' })
  @IsObject()
  baseSchema: any;

  @ApiProperty({ description: 'The suggestion to apply/undo' })
  @IsObject()
  suggestion: any;

  @ApiProperty({ description: 'All suggestions (for context)' })
  @IsArray()
  allSuggestions: any[];

  @ApiProperty({ description: 'AI changes from original enhancement' })
  @IsArray()
  aiChanges: any[];

  @ApiProperty({ description: 'Action to perform', enum: ['apply', 'undo'] })
  @IsEnum(['apply', 'undo'])
  action: 'apply' | 'undo';
}

// ===== Recalculate Quality DTO =====
export class RecalculateQualityDto {
  @ApiProperty({ description: 'Base enhanced schema (before suggestions)' })
  @IsObject()
  baseSchema: any;

  @ApiProperty({ description: 'All suggestions with current applied state' })
  @IsArray()
  allSuggestions: any[];

  @ApiProperty({ description: 'AI changes from original enhancement' })
  @IsArray()
  aiChanges: any[];
}

// ===== Suggest Name DTO =====
export class SuggestNameDto {
  @ApiPropertyOptional({ description: 'Field names from the schema' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ description: 'Raw schema content for context' })
  @IsOptional()
  schemaContent?: any;
}
