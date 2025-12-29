import { IsOptional, IsString, IsObject } from 'class-validator';

/**
 * Request DTO for generating Spring Boot projects
 */
export class GenerateRequestDto {
  /**
   * Raw XML input (alternative to jsonSchema)
   */
  @IsOptional()
  @IsString()
  xmlInput?: string;

  /**
   * Pre-parsed JSON schema (alternative to xmlInput)
   */
  @IsOptional()
  @IsObject()
  jsonSchema?: any;

  /**
   * Optional project name (defaults to schema title)
   */
  @IsOptional()
  @IsString()
  projectName?: string;

  /**
   * Optional base package name (defaults to com.formsync.generated)
   */
  @IsOptional()
  @IsString()
  packageName?: string;
}
