import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplateService {
    constructor(private readonly prisma: PrismaService) { }

    async createTemplate(userId: string, dto: CreateTemplateDto) {
        return this.prisma.formTemplate.create({
            data: {
                name: dto.name,
                description: dto.description,
                content: dto.content,
                userId,
            },
        });
    }

    async getTemplates(userId: string) {
        return this.prisma.formTemplate.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getTemplate(id: string, userId: string) {
        const template = await this.prisma.formTemplate.findUnique({ where: { id } });
        if (!template) {
            throw new NotFoundException(`Template with ID "${id}" not found`);
        }
        if (template.userId !== userId) {
            throw new ForbiddenException('You do not have access to this template');
        }
        return template;
    }

    async deleteTemplate(id: string, userId: string) {
        const template = await this.prisma.formTemplate.findUnique({ where: { id } });
        if (!template) {
            throw new NotFoundException(`Template with ID "${id}" not found`);
        }
        if (template.userId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this template');
        }
        await this.prisma.formTemplate.delete({ where: { id } });
        return { message: 'Template deleted successfully' };
    }
}
