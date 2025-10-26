import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Opportunity, OpportunityStatus } from '../opportunity.entity';
import { Pipeline } from '../pipeline.entity';
import { PipelineStage } from '../pipeline-stage.entity';
import { Contact } from '../contact.entity';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  MoveOpportunityDto,
  WinOpportunityDto,
  LoseOpportunityDto,
  OpportunityQueryDto,
} from '../dto/opportunity.dto';

@Injectable()
export class OpportunityService {
  private readonly logger = new Logger(OpportunityService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Create a new opportunity
   */
  async create(
    createOpportunityDto: CreateOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    // Verify contact exists
    const contact = await this.contactRepository.findOne({
      where: { id: createOpportunityDto.contactId, tenantId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Verify stage exists and belongs to pipeline
    const stage = await this.stageRepository.findOne({
      where: {
        id: createOpportunityDto.stageId,
        pipelineId: createOpportunityDto.pipelineId,
        tenantId,
      },
    });

    if (!stage) {
      throw new NotFoundException('Stage not found in pipeline');
    }

    // Calculate expected value
    const probability = createOpportunityDto.probability || stage.probability;
    const value = createOpportunityDto.value || 0;
    const expectedValue = (value * probability) / 100;

    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      tenantId,
      probability,
      expectedValue,
      expectedCloseDate: createOpportunityDto.expectedCloseDate
        ? new Date(createOpportunityDto.expectedCloseDate)
        : undefined,
    });

    const saved = await this.opportunityRepository.save(opportunity);

    // Update counters
    await this.updateStageCounters(stage.id);
    await this.updatePipelineCounters(createOpportunityDto.pipelineId);
    await this.contactRepository.increment(
      { id: createOpportunityDto.contactId },
      'lifetime_value',
      expectedValue,
    );

    this.logger.log(`Created opportunity ${saved.id} (${saved.title})`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Find all opportunities with filters and pagination
   */
  async findAll(
    queryDto: OpportunityQueryDto,
    tenantId: string,
  ): Promise<{ data: Opportunity[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.contact', 'contact')
      .leftJoinAndSelect('opportunity.pipeline', 'pipeline')
      .leftJoinAndSelect('opportunity.stage', 'stage')
      .leftJoinAndSelect('opportunity.owner', 'owner')
      .where('opportunity.tenantId = :tenantId', { tenantId });

    // Search
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    // Filters
    if (queryDto.pipelineId) {
      queryBuilder.andWhere('opportunity.pipelineId = :pipelineId', {
        pipelineId: queryDto.pipelineId,
      });
    }

    if (queryDto.stageId) {
      queryBuilder.andWhere('opportunity.stageId = :stageId', {
        stageId: queryDto.stageId,
      });
    }

    if (queryDto.contactId) {
      queryBuilder.andWhere('opportunity.contactId = :contactId', {
        contactId: queryDto.contactId,
      });
    }

    if (queryDto.ownerId) {
      queryBuilder.andWhere('opportunity.ownerId = :ownerId', {
        ownerId: queryDto.ownerId,
      });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('opportunity.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.priority) {
      queryBuilder.andWhere('opportunity.priority = :priority', {
        priority: queryDto.priority,
      });
    }

    if (queryDto.minValue !== undefined) {
      queryBuilder.andWhere('opportunity.value >= :minValue', {
        minValue: queryDto.minValue,
      });
    }

    if (queryDto.maxValue !== undefined) {
      queryBuilder.andWhere('opportunity.value <= :maxValue', {
        maxValue: queryDto.maxValue,
      });
    }

    // Pagination and sorting
    queryBuilder
      .orderBy('opportunity.stagePosition', 'ASC')
      .addOrderBy('opportunity.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find one opportunity by ID
   */
  async findOne(id: string, tenantId: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id, tenantId },
      relations: ['contact', 'pipeline', 'stage', 'owner'],
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    return opportunity;
  }

  /**
   * Update opportunity
   */
  async update(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);
    const oldStageId = opportunity.stageId;
    const oldValue = opportunity.value;

    Object.assign(opportunity, updateOpportunityDto);

    // Recalculate expected value if value or probability changed
    if (
      updateOpportunityDto.value !== undefined ||
      updateOpportunityDto.probability !== undefined
    ) {
      opportunity.expectedValue =
        (opportunity.value * opportunity.probability) / 100;
    }

    // Handle expected close date
    if (updateOpportunityDto.expectedCloseDate) {
      opportunity.expectedCloseDate = new Date(
        updateOpportunityDto.expectedCloseDate,
      );
    }

    const saved = await this.opportunityRepository.save(opportunity);

    // Update counters if stage changed
    if (
      updateOpportunityDto.stageId &&
      updateOpportunityDto.stageId !== oldStageId
    ) {
      await this.updateStageCounters(oldStageId);
      await this.updateStageCounters(updateOpportunityDto.stageId);
    }

    // Update pipeline counters if value changed
    if (updateOpportunityDto.value !== undefined && oldValue !== opportunity.value) {
      await this.updatePipelineCounters(opportunity.pipelineId);
      await this.updateStageCounters(opportunity.stageId);
    }

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Move opportunity to different stage
   */
  async move(
    id: string,
    moveDto: MoveOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);
    const oldStageId = opportunity.stageId;

    // Verify stage exists
    const newStage = await this.stageRepository.findOne({
      where: { id: moveDto.stageId, tenantId },
    });

    if (!newStage) {
      throw new NotFoundException('Target stage not found');
    }

    // Update stage and position
    opportunity.stageId = moveDto.stageId;
    opportunity.stagePosition = moveDto.position || 0;
    opportunity.daysInStage = 0; // Reset days in stage

    // Update probability based on new stage
    opportunity.probability = newStage.probability;
    opportunity.expectedValue = (opportunity.value * opportunity.probability) / 100;

    const saved = await this.opportunityRepository.save(opportunity);

    // Update counters
    await this.updateStageCounters(oldStageId);
    await this.updateStageCounters(moveDto.stageId);

    this.logger.log(`Moved opportunity ${id} to stage ${moveDto.stageId}`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Mark opportunity as won
   */
  async win(
    id: string,
    winDto: WinOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);

    opportunity.status = OpportunityStatus.WON;
    opportunity.actualCloseDate = winDto.actualCloseDate
      ? new Date(winDto.actualCloseDate)
      : new Date();

    if (winDto.notes) {
      opportunity.metadata = {
        ...opportunity.metadata,
        winNotes: winDto.notes,
      };
    }

    const saved = await this.opportunityRepository.save(opportunity);

    // Update contact lifetime value
    await this.contactRepository.increment(
      { id: opportunity.contactId },
      'lifetime_value',
      opportunity.value,
    );

    this.logger.log(`Opportunity ${id} marked as won`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Mark opportunity as lost
   */
  async lose(
    id: string,
    loseDto: LoseOpportunityDto,
    tenantId: string,
  ): Promise<Opportunity> {
    const opportunity = await this.findOne(id, tenantId);

    opportunity.status = OpportunityStatus.LOST;
    opportunity.lostReason = loseDto.lostReason;
    opportunity.actualCloseDate = loseDto.actualCloseDate
      ? new Date(loseDto.actualCloseDate)
      : new Date();

    if (loseDto.notes) {
      opportunity.metadata = {
        ...opportunity.metadata,
        loseNotes: loseDto.notes,
      };
    }

    const saved = await this.opportunityRepository.save(opportunity);

    this.logger.log(`Opportunity ${id} marked as lost: ${loseDto.lostReason}`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Delete opportunity
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const opportunity = await this.findOne(id, tenantId);

    await this.opportunityRepository.softRemove(opportunity);

    // Update counters
    await this.updateStageCounters(opportunity.stageId);
    await this.updatePipelineCounters(opportunity.pipelineId);

    this.logger.log(`Deleted opportunity ${id} (${opportunity.title})`);
  }

  /**
   * Update stage counters (opportunity count and total value)
   */
  private async updateStageCounters(stageId: string): Promise<void> {
    const result = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(opportunity.value)', 'totalValue')
      .where('opportunity.stageId = :stageId', { stageId })
      .andWhere('opportunity.status = :status', {
        status: OpportunityStatus.OPEN,
      })
      .getRawOne();

    await this.stageRepository.update(stageId, {
      opportunityCount: parseInt(result.count || '0', 10),
      totalValue: parseFloat(result.totalValue || '0'),
    });
  }

  /**
   * Update pipeline counters (opportunity count and total value)
   */
  private async updatePipelineCounters(pipelineId: string): Promise<void> {
    const result = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(opportunity.value)', 'totalValue')
      .where('opportunity.pipelineId = :pipelineId', { pipelineId })
      .andWhere('opportunity.status = :status', {
        status: OpportunityStatus.OPEN,
      })
      .getRawOne();

    await this.pipelineRepository.update(pipelineId, {
      opportunityCount: parseInt(result.count || '0', 10),
      totalValue: parseFloat(result.totalValue || '0'),
    });
  }

  /**
   * Get opportunity statistics
   */
  async getStats(tenantId: string): Promise<any> {
    const total = await this.opportunityRepository.count({
      where: { tenantId },
    });

    const byStatus = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('opportunity.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(opportunity.value)', 'totalValue')
      .where('opportunity.tenantId = :tenantId', { tenantId })
      .groupBy('opportunity.status')
      .getRawMany();

    const totalValue = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('SUM(opportunity.value)', 'sum')
      .where('opportunity.tenantId = :tenantId', { tenantId })
      .andWhere('opportunity.status = :status', {
        status: OpportunityStatus.OPEN,
      })
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const expectedValue = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('SUM(opportunity.expectedValue)', 'sum')
      .where('opportunity.tenantId = :tenantId', { tenantId })
      .andWhere('opportunity.status = :status', {
        status: OpportunityStatus.OPEN,
      })
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    return {
      total,
      byStatus,
      totalValue,
      expectedValue,
    };
  }
}
