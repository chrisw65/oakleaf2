import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationRule, AutomationStatus } from '../automation-rule.entity';
import {
  CreateAutomationRuleDto,
  UpdateAutomationRuleDto,
  AutomationRuleQueryDto,
} from '../dto/automation-rule.dto';

@Injectable()
export class AutomationRuleService {
  private readonly logger = new Logger(AutomationRuleService.name);

  constructor(
    @InjectRepository(AutomationRule)
    private readonly automationRuleRepository: Repository<AutomationRule>,
  ) {}

  /**
   * Create a new automation rule
   */
  async create(
    createDto: CreateAutomationRuleDto,
    tenantId: string,
    userId?: string,
  ): Promise<AutomationRule> {
    const rule = this.automationRuleRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.automationRuleRepository.save(rule);
    this.logger.log(`Created automation rule: ${saved.name}`);

    return saved;
  }

  /**
   * Find all automation rules
   */
  async findAll(
    queryDto: AutomationRuleQueryDto,
    tenantId: string,
  ): Promise<{ data: AutomationRule[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.automationRuleRepository
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.creator', 'creator')
      .where('rule.tenantId = :tenantId', { tenantId })
      .andWhere('rule.deletedAt IS NULL');

    if (queryDto.status) {
      queryBuilder.andWhere('rule.status = :status', { status: queryDto.status });
    }

    if (queryDto.trigger) {
      queryBuilder.andWhere('rule.trigger = :trigger', { trigger: queryDto.trigger });
    }

    if (queryDto.search) {
      queryBuilder.andWhere('rule.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('rule.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find automation rule by ID
   */
  async findOne(id: string, tenantId: string): Promise<AutomationRule> {
    const rule = await this.automationRuleRepository.findOne({
      where: { id, tenantId },
      relations: ['creator'],
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found');
    }

    return rule;
  }

  /**
   * Update automation rule
   */
  async update(
    id: string,
    updateDto: UpdateAutomationRuleDto,
    tenantId: string,
  ): Promise<AutomationRule> {
    const rule = await this.findOne(id, tenantId);

    Object.assign(rule, updateDto);
    const updated = await this.automationRuleRepository.save(rule);

    this.logger.log(`Updated automation rule: ${updated.name}`);
    return updated;
  }

  /**
   * Delete automation rule
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const rule = await this.findOne(id, tenantId);
    await this.automationRuleRepository.softDelete(id);
    this.logger.log(`Deleted automation rule: ${rule.name}`);
  }

  /**
   * Toggle automation rule status
   */
  async toggleStatus(
    id: string,
    tenantId: string,
  ): Promise<AutomationRule> {
    const rule = await this.findOne(id, tenantId);

    rule.status = rule.status === AutomationStatus.ACTIVE
      ? AutomationStatus.PAUSED
      : AutomationStatus.ACTIVE;

    const updated = await this.automationRuleRepository.save(rule);
    this.logger.log(`Toggled automation rule ${updated.name} to ${updated.status}`);

    return updated;
  }

  /**
   * Increment execution count
   */
  async incrementExecution(
    id: string,
    success: boolean,
    tenantId: string,
  ): Promise<void> {
    const updates: any = {
      executionCount: () => 'execution_count + 1',
      lastExecutedAt: new Date(),
    };

    if (success) {
      updates.successCount = () => 'success_count + 1';
    } else {
      updates.failureCount = () => 'failure_count + 1';
    }

    await this.automationRuleRepository.update({ id, tenantId }, updates);
  }

  /**
   * Get automation rule statistics
   */
  async getStatistics(tenantId: string): Promise<{
    total: number;
    byTrigger: any[];
    byStatus: any[];
    topPerforming: AutomationRule[];
  }> {
    const total = await this.automationRuleRepository.count({
      where: { tenantId },
    });

    const byTrigger = await this.automationRuleRepository
      .createQueryBuilder('rule')
      .select('rule.trigger', 'trigger')
      .addSelect('COUNT(*)', 'count')
      .where('rule.tenantId = :tenantId', { tenantId })
      .groupBy('rule.trigger')
      .getRawMany();

    const byStatus = await this.automationRuleRepository
      .createQueryBuilder('rule')
      .select('rule.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('rule.tenantId = :tenantId', { tenantId })
      .groupBy('rule.status')
      .getRawMany();

    const topPerforming = await this.automationRuleRepository.find({
      where: { tenantId, status: AutomationStatus.ACTIVE },
      order: { executionCount: 'DESC' },
      take: 10,
    });

    return {
      total,
      byTrigger,
      byStatus,
      topPerforming,
    };
  }
}
