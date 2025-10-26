import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from '../pipeline.entity';
import { PipelineStage } from '../pipeline-stage.entity';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  AddPipelineStageDto,
  UpdatePipelineStageDto,
  ReorderStagesDto,
} from '../dto/pipeline.dto';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
  ) {}

  /**
   * Create a new pipeline
   */
  async create(
    createPipelineDto: CreatePipelineDto,
    tenantId: string,
  ): Promise<Pipeline> {
    const pipeline = this.pipelineRepository.create({
      ...createPipelineDto,
      tenantId,
      stages: undefined, // Will add stages separately
    });

    const saved = await this.pipelineRepository.save(pipeline);

    // Create default stages if provided
    if (createPipelineDto.stages && createPipelineDto.stages.length > 0) {
      for (let i = 0; i < createPipelineDto.stages.length; i++) {
        const stageDto = createPipelineDto.stages[i];
        const stage = this.stageRepository.create({
          tenantId,
          pipelineId: saved.id,
          name: stageDto.name,
          position: i,
          probability: stageDto.probability || 50,
          color: stageDto.color || '#3B82F6',
        });
        await this.stageRepository.save(stage);
      }
    } else {
      // Create default stages
      const defaultStages = [
        { name: 'Lead', probability: 10, color: '#94A3B8' },
        { name: 'Qualified', probability: 30, color: '#3B82F6' },
        { name: 'Proposal', probability: 60, color: '#F59E0B' },
        { name: 'Negotiation', probability: 80, color: '#10B981' },
        { name: 'Closed Won', probability: 100, color: '#059669' },
      ];

      for (let i = 0; i < defaultStages.length; i++) {
        const stage = this.stageRepository.create({
          tenantId,
          pipelineId: saved.id,
          ...defaultStages[i],
          position: i,
        });
        await this.stageRepository.save(stage);
      }
    }

    this.logger.log(`Created pipeline ${saved.id} (${saved.name})`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Find all pipelines
   */
  async findAll(tenantId: string): Promise<Pipeline[]> {
    return this.pipelineRepository.find({
      where: { tenantId },
      relations: ['stages'],
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Find one pipeline by ID
   */
  async findOne(id: string, tenantId: string): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id, tenantId },
      relations: ['stages'],
      order: {
        stages: {
          position: 'ASC',
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  /**
   * Find default pipeline
   */
  async findDefault(tenantId: string): Promise<Pipeline | null> {
    return this.pipelineRepository.findOne({
      where: { tenantId, isDefault: true, isActive: true },
      relations: ['stages'],
    });
  }

  /**
   * Update pipeline
   */
  async update(
    id: string,
    updatePipelineDto: UpdatePipelineDto,
    tenantId: string,
  ): Promise<Pipeline> {
    const pipeline = await this.findOne(id, tenantId);

    // If setting as default, unset other defaults
    if (updatePipelineDto.isDefault) {
      await this.pipelineRepository.update(
        { tenantId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(pipeline, updatePipelineDto);

    return this.pipelineRepository.save(pipeline);
  }

  /**
   * Delete pipeline
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const pipeline = await this.findOne(id, tenantId);

    if (pipeline.opportunityCount > 0) {
      throw new BadRequestException(
        'Cannot delete pipeline with existing opportunities',
      );
    }

    await this.pipelineRepository.softRemove(pipeline);
    this.logger.log(`Deleted pipeline ${id} (${pipeline.name})`);
  }

  /**
   * Add stage to pipeline
   */
  async addStage(
    pipelineId: string,
    addStageDto: AddPipelineStageDto,
    tenantId: string,
  ): Promise<PipelineStage> {
    const pipeline = await this.findOne(pipelineId, tenantId);

    let position = pipeline.stages.length;

    // If afterStageId is provided, insert after that stage
    if (addStageDto.afterStageId) {
      const afterStage = pipeline.stages.find(
        (s) => s.id === addStageDto.afterStageId,
      );

      if (!afterStage) {
        throw new NotFoundException('Stage not found');
      }

      position = afterStage.position + 1;

      // Shift positions of stages after insert point
      for (const stage of pipeline.stages) {
        if (stage.position >= position) {
          stage.position++;
          await this.stageRepository.save(stage);
        }
      }
    }

    const stage = this.stageRepository.create({
      tenantId,
      pipelineId,
      name: addStageDto.name,
      position,
      probability: addStageDto.probability || 50,
      color: addStageDto.color || '#3B82F6',
    });

    const saved = await this.stageRepository.save(stage);

    this.logger.log(`Added stage ${saved.id} to pipeline ${pipelineId}`);

    return saved;
  }

  /**
   * Update stage
   */
  async updateStage(
    stageId: string,
    updateStageDto: UpdatePipelineStageDto,
    tenantId: string,
  ): Promise<PipelineStage> {
    const stage = await this.stageRepository.findOne({
      where: { id: stageId, tenantId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    Object.assign(stage, updateStageDto);

    return this.stageRepository.save(stage);
  }

  /**
   * Delete stage
   */
  async removeStage(stageId: string, tenantId: string): Promise<void> {
    const stage = await this.stageRepository.findOne({
      where: { id: stageId, tenantId },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found');
    }

    if (stage.opportunityCount > 0) {
      throw new BadRequestException(
        'Cannot delete stage with existing opportunities',
      );
    }

    await this.stageRepository.softRemove(stage);

    // Reorder remaining stages
    const pipeline = await this.findOne(stage.pipelineId, tenantId);
    for (let i = 0; i < pipeline.stages.length; i++) {
      if (pipeline.stages[i].position !== i) {
        pipeline.stages[i].position = i;
        await this.stageRepository.save(pipeline.stages[i]);
      }
    }

    this.logger.log(`Deleted stage ${stageId}`);
  }

  /**
   * Reorder stages
   */
  async reorderStages(
    pipelineId: string,
    reorderDto: ReorderStagesDto,
    tenantId: string,
  ): Promise<Pipeline> {
    const pipeline = await this.findOne(pipelineId, tenantId);

    for (let i = 0; i < reorderDto.stageIds.length; i++) {
      const stage = pipeline.stages.find((s) => s.id === reorderDto.stageIds[i]);

      if (stage) {
        stage.position = i;
        await this.stageRepository.save(stage);
      }
    }

    return this.findOne(pipelineId, tenantId);
  }

  /**
   * Get pipeline statistics
   */
  async getStats(pipelineId: string, tenantId: string): Promise<any> {
    const pipeline = await this.findOne(pipelineId, tenantId);

    const stageStats = await Promise.all(
      pipeline.stages.map(async (stage) => {
        return {
          stageId: stage.id,
          stageName: stage.name,
          opportunityCount: stage.opportunityCount,
          totalValue: stage.totalValue,
          probability: stage.probability,
        };
      }),
    );

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      totalOpportunities: pipeline.opportunityCount,
      totalValue: pipeline.totalValue,
      stages: stageStats,
    };
  }
}
