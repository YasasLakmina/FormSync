import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('template')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('template')
export class TemplateController {
    constructor(private readonly templateService: TemplateService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Save a new form template' })
    @ApiResponse({ status: 201, description: 'Template saved successfully' })
    async create(@Request() req: any, @Body() dto: CreateTemplateDto) {
        return this.templateService.createTemplate(req.user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: "List all of the current user's templates" })
    @ApiResponse({ status: 200, description: 'Templates listed' })
    async list(@Request() req: any) {
        return this.templateService.getTemplates(req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single template by ID' })
    @ApiResponse({ status: 200, description: 'Template returned' })
    @ApiResponse({ status: 404, description: 'Template not found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getOne(@Param('id') id: string, @Request() req: any) {
        return this.templateService.getTemplate(id, req.user.userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a template' })
    @ApiResponse({ status: 200, description: 'Template deleted' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async delete(@Param('id') id: string, @Request() req: any) {
        return this.templateService.deleteTemplate(id, req.user.userId);
    }
}
