import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSrsProjectDto, UpdateUserStoryStatusDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(userId: string, dto: CreateSrsProjectDto) {
    return this.prisma.srsProject.create({
      data: {
        name: dto.name,
        description: dto.description,
        userId,
        userStories: {
          create: (dto.userStories ?? []).map((s) => ({
            title: s.title,
            role: s.role,
            action: s.action,
            benefit: s.benefit,
            acceptanceCriteria: s.acceptanceCriteria ?? [],
            suggestedFields: s.suggestedFields ?? [],
            featureArea: s.featureArea ?? 'General',
            confidence: s.confidence ?? 0.7,
            rawText: s.rawText ?? '',
          })),
        },
      },
      include: { userStories: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getProjects(userId: string) {
    return this.prisma.srsProject.findMany({
      where: { userId },
      include: {
        userStories: { orderBy: { createdAt: 'asc' } },
        _count: { select: { userStories: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProject(id: string, userId: string) {
    const project = await this.prisma.srsProject.findUnique({
      where: { id },
      include: { userStories: { orderBy: { createdAt: 'asc' } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    return project;
  }

  async deleteProject(id: string, userId: string) {
    const project = await this.prisma.srsProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    await this.prisma.srsProject.delete({ where: { id } });
    return { message: 'Project deleted' };
  }

  async updateStoryStatus(projectId: string, storyId: string, userId: string, dto: UpdateUserStoryStatusDto) {
    const project = await this.prisma.srsProject.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();

    return this.prisma.userStory.update({
      where: { id: storyId },
      data: { status: dto.status, generatedSchemaId: dto.generatedSchemaId },
    });
  }
}
