import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunnelGoal, GoalStatus } from '../funnel-goal.entity';
import { FunnelCondition } from '../funnel-condition.entity';
import { FunnelSuggestion, SuggestionStatus } from '../funnel-suggestion.entity';
import {
  CreateFunnelGoalDto,
  UpdateFunnelGoalDto,
  CreateFunnelConditionDto,
  UpdateFunnelConditionDto,
  UpdateSuggestionStatusDto,
} from '../dto/funnel-enhanced.dto';

@Injectable()
export class FunnelEnhancedService {
  private readonly logger = new Logger(FunnelEnhancedService.name);

  constructor(
    @InjectRepository(FunnelGoal)
    private readonly goalRepository: Repository<FunnelGoal>,
    @InjectRepository(FunnelCondition)
    private readonly conditionRepository: Repository<FunnelCondition>,
    @InjectRepository(FunnelSuggestion)
    private readonly suggestionRepository: Repository<FunnelSuggestion>,
  ) {}

  // ===== Goals =====

  async createGoal(funnelId: string, createDto: CreateFunnelGoalDto, tenantId: string): Promise<FunnelGoal> {
    const goal = this.goalRepository.create({ ...createDto, funnelId, tenantId });
    return await this.goalRepository.save(goal);
  }

  async getGoals(funnelId: string, tenantId: string): Promise<FunnelGoal[]> {
    return await this.goalRepository.find({
      where: { funnelId, tenantId, status: GoalStatus.ACTIVE },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async updateGoal(id: string, updateDto: UpdateFunnelGoalDto, tenantId: string): Promise<FunnelGoal> {
    const goal = await this.goalRepository.findOne({ where: { id, tenantId } });
    if (!goal) throw new NotFoundException('Goal not found');

    Object.assign(goal, updateDto);
    return await this.goalRepository.save(goal);
  }

  async deleteGoal(id: string, tenantId: string): Promise<void> {
    await this.goalRepository.softDelete({ id, tenantId });
  }

  // ===== Conditions =====

  async createCondition(funnelId: string, createDto: CreateFunnelConditionDto, tenantId: string): Promise<FunnelCondition> {
    const condition = this.conditionRepository.create({ ...createDto, funnelId, tenantId });
    return await this.conditionRepository.save(condition);
  }

  async getConditions(funnelId: string, tenantId: string): Promise<FunnelCondition[]> {
    return await this.conditionRepository.find({
      where: { funnelId, tenantId, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async updateCondition(id: string, updateDto: UpdateFunnelConditionDto, tenantId: string): Promise<FunnelCondition> {
    const condition = await this.conditionRepository.findOne({ where: { id, tenantId } });
    if (!condition) throw new NotFoundException('Condition not found');

    Object.assign(condition, updateDto);
    return await this.conditionRepository.save(condition);
  }

  async deleteCondition(id: string, tenantId: string): Promise<void> {
    await this.conditionRepository.softDelete({ id, tenantId });
  }

  // ===== Suggestions =====

  async getSuggestions(funnelId: string, tenantId: string): Promise<FunnelSuggestion[]> {
    return await this.suggestionRepository.find({
      where: { funnelId, tenantId, status: SuggestionStatus.PENDING },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateSuggestionStatus(id: string, statusDto: UpdateSuggestionStatusDto, tenantId: string): Promise<FunnelSuggestion> {
    const suggestion = await this.suggestionRepository.findOne({ where: { id, tenantId } });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    suggestion.status = statusDto.status;
    if (statusDto.status === SuggestionStatus.DISMISSED && statusDto.dismissalReason) {
      suggestion.dismissedAt = new Date();
      suggestion.dismissalReason = statusDto.dismissalReason;
    } else if (statusDto.status === SuggestionStatus.IMPLEMENTED) {
      suggestion.implementedAt = new Date();
    }

    return await this.suggestionRepository.save(suggestion);
  }

  async generateSuggestions(funnelId: string, tenantId: string): Promise<FunnelSuggestion[]> {
    // This would normally use AI/ML models or complex analytics
    // For now, we'll create placeholder suggestions based on simple rules
    const suggestions = [];

    // Example suggestion
    const suggestion = this.suggestionRepository.create({
      funnelId,
      tenantId,
      type: 'conversion_optimization' as any,
      priority: 'high' as any,
      title: 'Add exit-intent popup',
      description: 'Consider adding an exit-intent popup to capture visitors before they leave',
      reasoning: 'Analysis shows high bounce rate on landing page',
      estimatedImpact: 15,
      impactMetric: 'conversion_rate',
      actionSteps: [
        { step: 1, action: 'Create exit-intent popup design' },
        { step: 2, action: 'Add compelling offer or lead magnet' },
        { step: 3, action: 'Implement and test' },
      ],
    });

    const saved = await this.suggestionRepository.save(suggestion);
    suggestions.push(saved);

    return suggestions;
  }
}
