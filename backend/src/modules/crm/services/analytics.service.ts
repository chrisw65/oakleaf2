import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Contact, ContactStatus } from '../contact.entity';
import { Opportunity } from '../opportunity.entity';
import { Task, TaskStatus } from '../task.entity';
import { Pipeline } from '../pipeline.entity';
import { PipelineStage } from '../pipeline-stage.entity';

export interface DashboardMetrics {
  pipeline: {
    totalValue: number;
    totalCount: number;
    wonValue: number;
    wonCount: number;
    lostValue: number;
    lostCount: number;
    activeValue: number;
    activeCount: number;
    winRate: number;
    averageDealSize: number;
    byStage: Array<{
      stageName: string;
      count: number;
      value: number;
    }>;
  };
  tasks: {
    total: number;
    overdue: number;
    dueToday: number;
    completed: number;
    completionRate: number;
  };
  contacts: {
    total: number;
    newThisMonth: number;
    activeLeads: number;
    customers: number;
    averageScore: number;
  };
  forecast: {
    currentMonth: number;
    nextMonth: number;
    currentQuarter: number;
  };
}

export interface PipelineHealthReport {
  pipelineId: string;
  pipelineName: string;
  stages: Array<{
    stageId: string;
    stageName: string;
    order: number;
    opportunityCount: number;
    totalValue: number;
    averageValue: number;
    averageDaysInStage: number;
    stalledCount: number; // Opportunities in stage > 30 days
    conversionRate: number;
  }>;
  totalOpportunities: number;
  totalValue: number;
  averageDealSize: number;
  medianDealSize: number;
  velocity: number; // Average days from created to won
}

export interface RepPerformanceReport {
  userId: string;
  userName: string;
  metrics: {
    opportunitiesOwned: number;
    opportunitiesWon: number;
    opportunitiesLost: number;
    totalValue: number;
    wonValue: number;
    winRate: number;
    averageDealSize: number;
    tasksCompleted: number;
    tasksOverdue: number;
    activitiesLogged: number;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Pipeline)
    private pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStage)
    private stageRepository: Repository<PipelineStage>,
  ) {}

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(tenantId: string, userId?: string): Promise<DashboardMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Build base query conditions
    const opportunityWhere: any = { tenantId };
    const taskWhere: any = { tenantId };
    const contactWhere: any = { tenantId };

    if (userId) {
      opportunityWhere.ownerId = userId;
      taskWhere.assignedToId = userId;
      contactWhere.ownerId = userId;
    }

    // Pipeline metrics
    const allOpportunities = await this.opportunityRepository.find({
      where: opportunityWhere,
      relations: ['stage'],
    });

    const wonOpportunities = allOpportunities.filter(o => o.status === 'won');
    const lostOpportunities = allOpportunities.filter(o => o.status === 'lost');
    const activeOpportunities = allOpportunities.filter(o => o.status === 'open');

    const totalValue = allOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
    const wonValue = wonOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
    const lostValue = lostOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
    const activeValue = activeOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);

    const winRate = wonOpportunities.length + lostOpportunities.length > 0
      ? (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100
      : 0;

    const averageDealSize = wonOpportunities.length > 0
      ? wonValue / wonOpportunities.length
      : 0;

    // Group by stage
    const byStageMap = new Map<string, { count: number; value: number }>();
    activeOpportunities.forEach(opp => {
      const stageName = opp.stage?.name || 'Unknown';
      const existing = byStageMap.get(stageName) || { count: 0, value: 0 };
      existing.count++;
      existing.value += opp.value || 0;
      byStageMap.set(stageName, existing);
    });

    const byStage = Array.from(byStageMap.entries()).map(([stageName, data]) => ({
      stageName,
      count: data.count,
      value: data.value,
    }));

    // Task metrics
    const allTasks = await this.taskRepository.find({
      where: taskWhere,
    });

    const overdueTasks = allTasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== TaskStatus.COMPLETED &&
      t.status !== TaskStatus.CANCELLED
    );

    const dueTodayTasks = allTasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) >= startOfDay &&
      new Date(t.dueDate) <= endOfDay &&
      t.status !== TaskStatus.COMPLETED &&
      t.status !== TaskStatus.CANCELLED
    );

    const completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED);
    const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

    // Contact metrics
    const allContacts = await this.contactRepository.find({
      where: contactWhere,
    });

    const newThisMonth = allContacts.filter(c =>
      c.createdAt >= startOfMonth
    ).length;

    const activeLeads = allContacts.filter(c => c.status === ContactStatus.LEAD).length;
    const customers = allContacts.filter(c => c.status === ContactStatus.CUSTOMER).length;

    const totalScore = allContacts.reduce((sum, c) => sum + (c.score || 0), 0);
    const averageScore = allContacts.length > 0 ? totalScore / allContacts.length : 0;

    // Forecast metrics (based on weighted pipeline)
    const currentMonthForecast = activeOpportunities
      .filter(o => {
        const closeDate = o.expectedCloseDate ? new Date(o.expectedCloseDate) : null;
        return closeDate && closeDate >= startOfMonth && closeDate < startOfNextMonth;
      })
      .reduce((sum, o) => sum + (o.value || 0) * ((o.probability || 0) / 100), 0);

    const nextMonthStart = startOfNextMonth;
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const nextMonthForecast = activeOpportunities
      .filter(o => {
        const closeDate = o.expectedCloseDate ? new Date(o.expectedCloseDate) : null;
        return closeDate && closeDate >= nextMonthStart && closeDate < nextMonthEnd;
      })
      .reduce((sum, o) => sum + (o.value || 0) * ((o.probability || 0) / 100), 0);

    const currentQuarterForecast = activeOpportunities
      .filter(o => {
        const closeDate = o.expectedCloseDate ? new Date(o.expectedCloseDate) : null;
        return closeDate && closeDate >= startOfQuarter && closeDate <= endOfQuarter;
      })
      .reduce((sum, o) => sum + (o.value || 0) * ((o.probability || 0) / 100), 0);

    return {
      pipeline: {
        totalValue,
        totalCount: allOpportunities.length,
        wonValue,
        wonCount: wonOpportunities.length,
        lostValue,
        lostCount: lostOpportunities.length,
        activeValue,
        activeCount: activeOpportunities.length,
        winRate,
        averageDealSize,
        byStage,
      },
      tasks: {
        total: allTasks.length,
        overdue: overdueTasks.length,
        dueToday: dueTodayTasks.length,
        completed: completedTasks.length,
        completionRate,
      },
      contacts: {
        total: allContacts.length,
        newThisMonth,
        activeLeads,
        customers,
        averageScore,
      },
      forecast: {
        currentMonth: currentMonthForecast,
        nextMonth: nextMonthForecast,
        currentQuarter: currentQuarterForecast,
      },
    };
  }

  /**
   * Get pipeline health report
   */
  async getPipelineHealthReport(pipelineId: string, tenantId: string): Promise<PipelineHealthReport> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id: pipelineId, tenantId },
      relations: ['stages', 'stages.opportunities'],
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stagesReport = pipeline.stages.map(stage => {
      const opportunities = stage.opportunities || [];
      const totalValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
      const averageValue = opportunities.length > 0 ? totalValue / opportunities.length : 0;

      // Calculate average days in stage
      const totalDays = opportunities.reduce((sum, o) => {
        const enteredStageAt = o.updatedAt; // Simplified - would need stage history
        const days = Math.floor((now.getTime() - enteredStageAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      const averageDaysInStage = opportunities.length > 0 ? totalDays / opportunities.length : 0;

      // Count stalled opportunities (in stage > 30 days)
      const stalledCount = opportunities.filter(o => {
        const enteredStageAt = o.updatedAt;
        return enteredStageAt < thirtyDaysAgo;
      }).length;

      // Simplified conversion rate (would need historical data)
      const conversionRate = 0; // Placeholder

      return {
        stageId: stage.id,
        stageName: stage.name,
        order: stage.order,
        opportunityCount: opportunities.length,
        totalValue,
        averageValue,
        averageDaysInStage,
        stalledCount,
        conversionRate,
      };
    });

    const allOpportunities = pipeline.stages.flatMap(s => s.opportunities || []);
    const totalValue = allOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
    const averageDealSize = allOpportunities.length > 0 ? totalValue / allOpportunities.length : 0;

    // Calculate median
    const sortedValues = allOpportunities.map(o => o.value || 0).sort((a, b) => a - b);
    const medianDealSize = sortedValues.length > 0
      ? sortedValues[Math.floor(sortedValues.length / 2)]
      : 0;

    // Calculate velocity (simplified)
    const wonOpportunities = allOpportunities.filter(o => o.status === 'won');
    const totalDaysToWin = wonOpportunities.reduce((sum, o) => {
      const days = Math.floor((o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    const velocity = wonOpportunities.length > 0 ? totalDaysToWin / wonOpportunities.length : 0;

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      stages: stagesReport,
      totalOpportunities: allOpportunities.length,
      totalValue,
      averageDealSize,
      medianDealSize,
      velocity,
    };
  }

  /**
   * Get rep performance report
   */
  async getRepPerformanceReport(tenantId: string): Promise<RepPerformanceReport[]> {
    // Get all opportunities grouped by owner
    const opportunities = await this.opportunityRepository.find({
      where: { tenantId },
      relations: ['owner'],
    });

    const tasks = await this.taskRepository.find({
      where: { tenantId },
      relations: ['assignedTo'],
    });

    // Group by user
    const userMap = new Map<string, RepPerformanceReport>();

    opportunities.forEach(opp => {
      if (!opp.owner) return;

      const userId = opp.owner.id;
      const userName = `${opp.owner.firstName} ${opp.owner.lastName}`;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName,
          metrics: {
            opportunitiesOwned: 0,
            opportunitiesWon: 0,
            opportunitiesLost: 0,
            totalValue: 0,
            wonValue: 0,
            winRate: 0,
            averageDealSize: 0,
            tasksCompleted: 0,
            tasksOverdue: 0,
            activitiesLogged: 0,
          },
        });
      }

      const report = userMap.get(userId)!;
      report.metrics.opportunitiesOwned++;
      report.metrics.totalValue += opp.value || 0;

      if (opp.status === 'won') {
        report.metrics.opportunitiesWon++;
        report.metrics.wonValue += opp.value || 0;
      } else if (opp.status === 'lost') {
        report.metrics.opportunitiesLost++;
      }
    });

    // Add task metrics
    const now = new Date();
    tasks.forEach(task => {
      if (!task.assignedTo) return;

      const userId = task.assignedTo.id;
      const report = userMap.get(userId);
      if (!report) return;

      if (task.status === TaskStatus.COMPLETED) {
        report.metrics.tasksCompleted++;
      } else if (task.dueDate && new Date(task.dueDate) < now) {
        report.metrics.tasksOverdue++;
      }
    });

    // Calculate derived metrics
    userMap.forEach(report => {
      const totalClosed = report.metrics.opportunitiesWon + report.metrics.opportunitiesLost;
      report.metrics.winRate = totalClosed > 0
        ? (report.metrics.opportunitiesWon / totalClosed) * 100
        : 0;

      report.metrics.averageDealSize = report.metrics.opportunitiesWon > 0
        ? report.metrics.wonValue / report.metrics.opportunitiesWon
        : 0;
    });

    return Array.from(userMap.values());
  }
}
