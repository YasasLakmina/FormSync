import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CreateSrsProjectDto, UpdateUserStoryStatusDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new SRS project with extracted user stories' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Request() req: any, @Body() dto: CreateSrsProjectDto) {
    return this.projectService.createProject(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List all SRS projects for the current user" })
  @ApiResponse({ status: 200, description: 'Projects listed' })
  async list(@Request() req: any) {
    return this.projectService.getProjects(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single SRS project by ID' })
  @ApiResponse({ status: 200, description: 'Project returned' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getOne(@Param('id') id: string, @Request() req: any) {
    return this.projectService.getProject(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SRS project' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.projectService.deleteProject(id, req.user.userId);
  }

  @Patch(':projectId/stories/:storyId/status')
  @ApiOperation({ summary: 'Update user story status (draft → generated)' })
  @ApiResponse({ status: 200, description: 'Story status updated' })
  async updateStoryStatus(
    @Param('projectId') projectId: string,
    @Param('storyId') storyId: string,
    @Request() req: any,
    @Body() dto: UpdateUserStoryStatusDto,
  ) {
    return this.projectService.updateStoryStatus(projectId, storyId, req.user.userId, dto);
  }
}
