import { IsString, IsOptional, IsArray, IsNumber, IsJSON, IsIn, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSrsProjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  userStories: CreateUserStoryDto[];
}

export class CreateUserStoryDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() role: string;
  @ApiProperty() @IsString() action: string;
  @ApiProperty() @IsString() benefit: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() acceptanceCriteria?: string[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional() @IsArray() suggestedFields?: any[];

  @ApiPropertyOptional() @IsOptional() @IsString() featureArea?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0) @Max(1) confidence?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() rawText?: string;
}

export class UpdateUserStoryStatusDto {
  @ApiProperty({ enum: ['draft', 'generated'] })
  @IsIn(['draft', 'generated'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() generatedSchemaId?: string;
}
