import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
    @ApiProperty({ example: 'Employee Onboarding Form' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Template for employee onboarding', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'JSON representation of the form builder state (FormModel)' })
    @IsNotEmpty()
    content: any;
}
