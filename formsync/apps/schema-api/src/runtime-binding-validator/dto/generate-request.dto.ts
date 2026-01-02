import { IsOptional, IsString, IsObject } from 'class-validator';
import { FormSyncSchema } from './formsync-schema.dto';

/**
 * Request DTO for generating Spring Boot projects
 */
export class GenerateRequestDto {
  /**
   * Raw XML input (alternative to jsonSchema or formSyncSchema)
   */
  @IsOptional()
  @IsString()
  xmlInput?: string;

  /**
   * Pre-parsed JSON schema (alternative to xmlInput or formSyncSchema)
   */
  @IsOptional()
  @IsObject()
  jsonSchema?: any;

  /**
   * FormSync JSON schema format (recommended)
   */
  @IsOptional()
  @IsObject()
  formSyncSchema?: FormSyncSchema;

  /**
   * Optional project name (defaults to schema title or form name)
   */
  @IsOptional()
  @IsString()
  projectName?: string;

  /**
   * Optional base package name (defaults to backend.package or com.formsync.generated)
   */
  @IsOptional()
  @IsString()
  packageName?: string;
}
