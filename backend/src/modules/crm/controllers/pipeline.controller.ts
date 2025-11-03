import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../user/user.entity';
import { PipelineService } from '../services/pipeline.service';
import { Pipeline } from '../pipeline.entity';
import { PipelineStage } from '../pipeline-stage.entity';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  AddPipelineStageDto,
  UpdatePipelineStageDto,
  ReorderStagesDto,
} from '../dto/pipeline.dto';

@ApiTags('Pipelines')
@Controller('crm/pipelines')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  @ApiOperation({ summary: 'Create new pipeline' })
  @ApiResponse({ status: 201, description: 'Pipeline created successfully' })
  async create(
    @Body() createPipelineDto: CreatePipelineDto,
    @CurrentUser() user: any,
  ): Promise<Pipeline> {
    return this.pipelineService.create(createPipelineDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pipelines' })
  @ApiResponse({ status: 200, description: 'List of pipelines' })
  async findAll(@CurrentUser() user: any): Promise<Pipeline[]> {
    return this.pipelineService.findAll(user.tenantId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default pipeline' })
  @ApiResponse({ status: 200, description: 'Default pipeline' })
  async findDefault(@CurrentUser() user: any): Promise<Pipeline | null> {
    return this.pipelineService.findDefault(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Pipeline> {
    return this.pipelineService.findOne(id, user.tenantId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get pipeline statistics' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline statistics' })
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.pipelineService.getStats(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updatePipelineDto: UpdatePipelineDto,
    @CurrentUser() user: any,
  ): Promise<Pipeline> {
    return this.pipelineService.update(id, updatePipelineDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Pipeline deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.pipelineService.remove(id, user.tenantId);
    return { message: 'Pipeline deleted successfully' };
  }

  @Post(':id/stages')
  @ApiOperation({ summary: 'Add stage to pipeline' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 201, description: 'Stage added successfully' })
  async addStage(
    @Param('id') id: string,
    @Body() addStageDto: AddPipelineStageDto,
    @CurrentUser() user: any,
  ): Promise<PipelineStage> {
    return this.pipelineService.addStage(id, addStageDto, user.tenantId);
  }

  @Put(':id/stages/reorder')
  @ApiOperation({ summary: 'Reorder pipeline stages' })
  @ApiParam({ name: 'id', description: 'Pipeline ID' })
  @ApiResponse({ status: 200, description: 'Stages reordered successfully' })
  async reorderStages(
    @Param('id') id: string,
    @Body() reorderDto: ReorderStagesDto,
    @CurrentUser() user: any,
  ): Promise<Pipeline> {
    return this.pipelineService.reorderStages(id, reorderDto, user.tenantId);
  }

  @Put('stages/:stageId')
  @ApiOperation({ summary: 'Update pipeline stage' })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({ status: 200, description: 'Stage updated successfully' })
  async updateStage(
    @Param('stageId') stageId: string,
    @Body() updateStageDto: UpdatePipelineStageDto,
    @CurrentUser() user: any,
  ): Promise<PipelineStage> {
    return this.pipelineService.updateStage(stageId, updateStageDto, user.tenantId);
  }

  @Delete('stages/:stageId')
  @ApiOperation({ summary: 'Delete pipeline stage' })
  @ApiParam({ name: 'stageId', description: 'Stage ID' })
  @ApiResponse({ status: 200, description: 'Stage deleted successfully' })
  async removeStage(
    @Param('stageId') stageId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.pipelineService.removeStage(stageId, user.tenantId);
    return { message: 'Stage deleted successfully' };
  }
}
