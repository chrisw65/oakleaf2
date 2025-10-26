import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent, EventType } from './analytics-event.entity';

export interface TrackEventDto {
  eventType: EventType;
  entityType?: string;
  entityId?: string;
  contactId?: string;
  affiliateId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsQuery {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  eventType?: EventType;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(trackEventDto: TrackEventDto, tenantId: string): Promise<AnalyticsEvent> {
    const event = this.eventRepository.create({
      ...trackEventDto,
      tenantId,
    });

    return this.eventRepository.save(event);
  }

  async getEvents(query: AnalyticsQuery): Promise<AnalyticsEvent[]> {
    const where: any = {
      tenantId: query.tenantId,
    };

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    }

    return this.eventRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000, // Limit to prevent huge queries
    });
  }

  async getEventCount(query: AnalyticsQuery): Promise<number> {
    const where: any = {
      tenantId: query.tenantId,
    };

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    }

    return this.eventRepository.count({ where });
  }

  async getFunnelAnalytics(funnelId: string, tenantId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pageViews = await this.getEventCount({
      tenantId,
      entityType: 'funnel',
      entityId: funnelId,
      eventType: EventType.PAGE_VIEW,
      startDate,
      endDate: new Date(),
    });

    const formSubmits = await this.getEventCount({
      tenantId,
      entityType: 'funnel',
      entityId: funnelId,
      eventType: EventType.FORM_SUBMIT,
      startDate,
      endDate: new Date(),
    });

    const purchases = await this.getEventCount({
      tenantId,
      entityType: 'funnel',
      entityId: funnelId,
      eventType: EventType.PURCHASE,
      startDate,
      endDate: new Date(),
    });

    return {
      period: `${days} days`,
      pageViews,
      formSubmits,
      purchases,
      optInRate: pageViews > 0 ? ((formSubmits / pageViews) * 100).toFixed(2) : 0,
      purchaseRate: formSubmits > 0 ? ((purchases / formSubmits) * 100).toFixed(2) : 0,
    };
  }

  async getPageAnalytics(pageId: string, tenantId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await this.getEventCount({
      tenantId,
      entityType: 'page',
      entityId: pageId,
      eventType: EventType.PAGE_VIEW,
      startDate,
      endDate: new Date(),
    });

    const submissions = await this.getEventCount({
      tenantId,
      entityType: 'page',
      entityId: pageId,
      eventType: EventType.FORM_SUBMIT,
      startDate,
      endDate: new Date(),
    });

    return {
      period: `${days} days`,
      views,
      submissions,
      conversionRate: views > 0 ? ((submissions / views) * 100).toFixed(2) : 0,
    };
  }
}
