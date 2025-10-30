import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FunnelAnalytics, AnalyticsPeriod } from '../funnel-analytics.entity';
import { FunnelSession } from '../funnel-session.entity';
import { FunnelEvent } from '../funnel-event.entity';
import { FunnelAnalyticsQueryDto } from '../dto/funnel-analytics.dto';

@Injectable()
export class FunnelAnalyticsService {
  private readonly logger = new Logger(FunnelAnalyticsService.name);

  constructor(
    @InjectRepository(FunnelAnalytics)
    private readonly analyticsRepository: Repository<FunnelAnalytics>,
    @InjectRepository(FunnelSession)
    private readonly sessionRepository: Repository<FunnelSession>,
    @InjectRepository(FunnelEvent)
    private readonly eventRepository: Repository<FunnelEvent>,
  ) {}

  /**
   * Get analytics for a funnel
   */
  async getAnalytics(
    funnelId: string,
    queryDto: FunnelAnalyticsQueryDto,
    tenantId: string,
  ): Promise<FunnelAnalytics[]> {
    const query: any = { funnelId, tenantId, period: queryDto.period || AnalyticsPeriod.DAILY };

    if (queryDto.startDate && queryDto.endDate) {
      query.periodDate = Between(new Date(queryDto.startDate), new Date(queryDto.endDate));
    }

    if (queryDto.variantId) {
      query.variantId = queryDto.variantId;
    }

    return await this.analyticsRepository.find({
      where: query,
      order: { periodDate: 'ASC' },
    });
  }

  /**
   * Generate insights and recommendations
   */
  async generateInsights(funnelId: string, tenantId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.sessionRepository.count({
      where: { funnelId, tenantId, createdAt: Between(startDate, new Date()) as any },
    });

    const conversions = await this.sessionRepository.count({
      where: { funnelId, tenantId, converted: true, createdAt: Between(startDate, new Date()) as any },
    });

    const conversionRate = sessions > 0 ? (conversions / sessions) * 100 : 0;

    const insights = {
      period: `Last ${days} days`,
      totalSessions: sessions,
      totalConversions: conversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      insights: [] as any[],
    };

    // Generate insights based on data
    if (conversionRate < 2) {
      insights.insights.push({
        type: 'low_conversion',
        priority: 'high',
        message: 'Conversion rate is below 2%. Consider reviewing your funnel flow and value proposition.',
      });
    }

    if (sessions < 100) {
      insights.insights.push({
        type: 'low_traffic',
        priority: 'medium',
        message: 'Traffic is low. Consider increasing marketing efforts or improving SEO.',
      });
    }

    return insights;
  }

  /**
   * Track a session
   */
  async trackSession(sessionData: any, tenantId: string): Promise<FunnelSession> {
    const session = this.sessionRepository.create({
      ...sessionData,
      tenantId,
    });

    return (await this.sessionRepository.save(session)) as unknown as FunnelSession;
  }

  /**
   * Track an event
   */
  async trackEvent(eventData: any, tenantId: string): Promise<FunnelEvent> {
    const event = this.eventRepository.create({
      ...eventData,
      tenantId,
      eventTime: new Date(),
    });

    const saved = (await this.eventRepository.save(event)) as unknown as FunnelEvent;

    // Update session if conversion
    if (eventData.isConversion) {
      await this.sessionRepository.update(
        { id: eventData.sessionId },
        { converted: true, convertedAt: new Date(), conversionValue: eventData.conversionValue || 0 },
      );
    }

    return saved;
  }
}
