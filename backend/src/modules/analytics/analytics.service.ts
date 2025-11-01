import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThan } from 'typeorm';
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
  private readonly logger = new Logger(AnalyticsService.name);

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

  /**
   * Get revenue analytics by time period
   */
  async getRevenueAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        eventType: In([EventType.ORDER_PAID, EventType.PURCHASE, EventType.CHECKOUT_COMPLETE]),
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const revenueByPeriod = new Map<string, number>();
    const ordersByPeriod = new Map<string, number>();

    events.forEach((event) => {
      const periodKey = this.getPeriodKey(event.createdAt, groupBy);
      const revenue = Number(event.metadata?.value || event.value || 0);

      revenueByPeriod.set(periodKey, (revenueByPeriod.get(periodKey) || 0) + revenue);
      ordersByPeriod.set(periodKey, (ordersByPeriod.get(periodKey) || 0) + 1);
    });

    const totalRevenue = Array.from(revenueByPeriod.values()).reduce((a, b) => a + b, 0);
    const totalOrders = Array.from(ordersByPeriod.values()).reduce((a, b) => a + b, 0);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      revenueByPeriod: Array.from(revenueByPeriod.entries()).map(([period, revenue]) => ({
        period,
        revenue: revenue.toFixed(2),
        orders: ordersByPeriod.get(period) || 0,
      })),
    };
  }

  /**
   * Get revenue by product
   */
  async getRevenueByProduct(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        eventType: In([EventType.ORDER_PAID, EventType.PURCHASE]),
        createdAt: Between(startDate, endDate),
      },
    });

    const revenueByProduct = new Map<string, { revenue: number; orders: number; name?: string }>();

    events.forEach((event) => {
      const productId = event.entityId;
      const productName = event.metadata?.productName || productId;
      const revenue = Number(event.metadata?.value || event.value || 0);

      if (productId) {
        const current = revenueByProduct.get(productId) || { revenue: 0, orders: 0, name: productName };
        revenueByProduct.set(productId, {
          revenue: current.revenue + revenue,
          orders: current.orders + 1,
          name: productName,
        });
      }
    });

    return Array.from(revenueByProduct.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        revenue: data.revenue.toFixed(2),
        orders: data.orders,
        averageOrderValue: (data.revenue / data.orders).toFixed(2),
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  /**
   * Get revenue by affiliate
   */
  async getRevenueByAffiliate(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        eventType: In([EventType.AFFILIATE_CONVERSION, EventType.COMMISSION_EARNED]),
        createdAt: Between(startDate, endDate),
      },
    });

    const dataByAffiliate = new Map<string, { revenue: number; conversions: number; commission: number }>();

    events.forEach((event) => {
      const affiliateId = event.affiliateId;
      if (affiliateId) {
        const current = dataByAffiliate.get(affiliateId) || { revenue: 0, conversions: 0, commission: 0 };
        const revenue = Number(event.metadata?.value || event.value || 0);
        const commission = Number(event.metadata?.commission || 0);

        dataByAffiliate.set(affiliateId, {
          revenue: current.revenue + revenue,
          conversions: current.conversions + 1,
          commission: current.commission + commission,
        });
      }
    });

    return Array.from(dataByAffiliate.entries())
      .map(([affiliateId, data]) => ({
        affiliateId,
        revenue: data.revenue.toFixed(2),
        conversions: data.conversions,
        commission: data.commission.toFixed(2),
        averageOrderValue: (data.revenue / data.conversions).toFixed(2),
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  /**
   * Get conversion funnel analysis with drop-off points
   */
  async getConversionFunnel(
    tenantId: string,
    funnelId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const steps = [
      { name: 'Funnel View', eventType: EventType.FUNNEL_VIEW },
      { name: 'Step View', eventType: EventType.FUNNEL_STEP_VIEW },
      { name: 'Form Start', eventType: EventType.FORM_START },
      { name: 'Form Submit', eventType: EventType.FORM_SUBMIT },
      { name: 'Checkout Start', eventType: EventType.CHECKOUT_START },
      { name: 'Order Created', eventType: EventType.ORDER_CREATED },
      { name: 'Order Paid', eventType: EventType.ORDER_PAID },
    ];

    const funnelData = [];
    let previousCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const count = await this.getEventCount({
        tenantId,
        entityId: funnelId,
        eventType: step.eventType,
        startDate,
        endDate,
      });

      const conversionRate = i === 0 ? 100 : previousCount > 0 ? ((count / previousCount) * 100).toFixed(2) : 0;
      const dropOff = i === 0 ? 0 : previousCount - count;
      const dropOffRate = i === 0 ? 0 : previousCount > 0 ? (((previousCount - count) / previousCount) * 100).toFixed(2) : 0;

      funnelData.push({
        step: i + 1,
        name: step.name,
        count,
        conversionRate: Number(conversionRate),
        dropOff,
        dropOffRate: Number(dropOffRate),
      });

      previousCount = count;
    }

    return {
      funnelId,
      steps: funnelData,
      overallConversionRate: funnelData[0]?.count > 0
        ? ((funnelData[funnelData.length - 1]?.count / funnelData[0].count) * 100).toFixed(2)
        : 0,
    };
  }

  /**
   * Get UTM campaign performance
   */
  async getUTMPerformance(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const campaignData = new Map<string, {
      clicks: number;
      conversions: number;
      revenue: number;
      source?: string;
      medium?: string;
    }>();

    events.forEach((event) => {
      if (event.utmCampaign) {
        const current = campaignData.get(event.utmCampaign) || {
          clicks: 0,
          conversions: 0,
          revenue: 0,
          source: event.utmSource,
          medium: event.utmMedium,
        };

        if (event.eventType === EventType.PAGE_VIEW) {
          current.clicks += 1;
        }

        if (event.isConversion()) {
          current.conversions += 1;
          current.revenue += Number(event.value || 0);
        }

        campaignData.set(event.utmCampaign, current);
      }
    });

    return Array.from(campaignData.entries())
      .map(([campaign, data]) => ({
        campaign,
        source: data.source,
        medium: data.medium,
        clicks: data.clicks,
        conversions: data.conversions,
        revenue: data.revenue.toFixed(2),
        conversionRate: data.clicks > 0 ? ((data.conversions / data.clicks) * 100).toFixed(2) : 0,
        revenuePerClick: data.clicks > 0 ? (data.revenue / data.clicks).toFixed(2) : 0,
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  /**
   * Get device analytics
   */
  async getDeviceAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const deviceData = new Map<string, { views: number; conversions: number; revenue: number }>();

    events.forEach((event) => {
      const device = event.deviceType || 'unknown';
      const current = deviceData.get(device) || { views: 0, conversions: 0, revenue: 0 };

      if (event.eventType === EventType.PAGE_VIEW) {
        current.views += 1;
      }

      if (event.isConversion()) {
        current.conversions += 1;
        current.revenue += Number(event.value || 0);
      }

      deviceData.set(device, current);
    });

    return Array.from(deviceData.entries())
      .map(([device, data]) => ({
        device,
        views: data.views,
        conversions: data.conversions,
        revenue: data.revenue.toFixed(2),
        conversionRate: data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  /**
   * Get geo analytics
   */
  async getGeoAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const countryData = new Map<string, { views: number; conversions: number; revenue: number }>();

    events.forEach((event) => {
      const country = event.country || 'unknown';
      const current = countryData.get(country) || { views: 0, conversions: 0, revenue: 0 };

      if (event.eventType === EventType.PAGE_VIEW) {
        current.views += 1;
      }

      if (event.isConversion()) {
        current.conversions += 1;
        current.revenue += Number(event.value || 0);
      }

      countryData.set(country, current);
    });

    return Array.from(countryData.entries())
      .map(([country, data]) => ({
        country,
        views: data.views,
        conversions: data.conversions,
        revenue: data.revenue.toFixed(2),
        conversionRate: data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));
  }

  /**
   * Get cohort analysis (user retention by signup date)
   */
  async getCohortAnalysis(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    cohortSize: 'week' | 'month' = 'month',
  ): Promise<any> {
    // Get all user signups in the period
    const signups = await this.eventRepository.find({
      where: {
        tenantId,
        eventType: EventType.USER_SIGNUP,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    // Group users by cohort (signup period)
    const cohorts = new Map<string, Set<string>>();

    signups.forEach((signup) => {
      const cohortKey = this.getPeriodKey(signup.createdAt, cohortSize);
      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, new Set());
      }
      if (signup.contactId) {
        cohorts.get(cohortKey)!.add(signup.contactId);
      }
    });

    // Calculate retention for each cohort
    const cohortData = [];

    for (const [cohortPeriod, users] of cohorts.entries()) {
      const cohortStartDate = this.parsePeriodKey(cohortPeriod, cohortSize);

      // Get activity in subsequent periods
      const retentionData = [];

      for (let period = 0; period < 6; period++) {
        const periodStart = new Date(cohortStartDate);
        const periodEnd = new Date(cohortStartDate);

        if (cohortSize === 'week') {
          periodStart.setDate(periodStart.getDate() + period * 7);
          periodEnd.setDate(periodEnd.getDate() + (period + 1) * 7);
        } else {
          periodStart.setMonth(periodStart.getMonth() + period);
          periodEnd.setMonth(periodEnd.getMonth() + period + 1);
        }

        // Count active users in this period
        const activeEvents = await this.eventRepository.find({
          where: {
            tenantId,
            contactId: In(Array.from(users)),
            createdAt: Between(periodStart, periodEnd),
          },
        });

        const activeUsers = new Set(activeEvents.map((e) => e.contactId).filter(Boolean));
        const retentionRate = users.size > 0 ? ((activeUsers.size / users.size) * 100).toFixed(2) : 0;

        retentionData.push({
          period,
          activeUsers: activeUsers.size,
          retentionRate: Number(retentionRate),
        });
      }

      cohortData.push({
        cohort: cohortPeriod,
        totalUsers: users.size,
        retention: retentionData,
      });
    }

    return cohortData;
  }

  /**
   * Get real-time metrics (last 24 hours)
   */
  async getRealTimeMetrics(tenantId: string): Promise<any> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      pageViews,
      conversions,
      revenue,
      activeUsers,
    ] = await Promise.all([
      this.getEventCount({ tenantId, startDate: last24Hours, endDate: new Date() }),
      this.getEventCount({ tenantId, eventType: EventType.PAGE_VIEW, startDate: last24Hours, endDate: new Date() }),
      this.getEventCount({
        tenantId,
        eventType: EventType.ORDER_PAID,
        startDate: last24Hours,
        endDate: new Date(),
      }),
      this.getTotalRevenue(tenantId, last24Hours, new Date()),
      this.getActiveUsers(tenantId, last24Hours, new Date()),
    ]);

    return {
      period: 'Last 24 hours',
      totalEvents,
      pageViews,
      conversions,
      revenue: revenue.toFixed(2),
      activeUsers,
      averageOrderValue: conversions > 0 ? (revenue / conversions).toFixed(2) : 0,
    };
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(
    tenantId: string,
    metric: 'revenue' | 'conversions' | 'traffic',
    days: number = 30,
  ): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.eventRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });

    const dailyData = new Map<string, number>();

    events.forEach((event) => {
      const day = event.createdAt.toISOString().split('T')[0];

      if (metric === 'revenue' && event.hasRevenue()) {
        dailyData.set(day, (dailyData.get(day) || 0) + Number(event.value || 0));
      } else if (metric === 'conversions' && event.isConversion()) {
        dailyData.set(day, (dailyData.get(day) || 0) + 1);
      } else if (metric === 'traffic' && event.eventType === EventType.PAGE_VIEW) {
        dailyData.set(day, (dailyData.get(day) || 0) + 1);
      }
    });

    const trendData = Array.from(dailyData.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend direction
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / (firstHalf.length || 1);
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / (secondHalf.length || 1);

    const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
    const trendPercentage = firstHalfAvg > 0
      ? (((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(2)
      : 0;

    return {
      metric,
      period: `${days} days`,
      data: trendData,
      trend: {
        direction: trendDirection,
        percentage: Number(trendPercentage),
      },
    };
  }

  /**
   * Helper: Get total revenue
   */
  private async getTotalRevenue(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        eventType: In([EventType.ORDER_PAID, EventType.PURCHASE]),
        createdAt: Between(startDate, endDate),
      },
    });

    return events.reduce((sum, event) => sum + Number(event.value || event.metadata?.value || 0), 0);
  }

  /**
   * Helper: Get active users
   */
  private async getActiveUsers(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const events = await this.eventRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const uniqueUsers = new Set(events.map((e) => e.contactId).filter(Boolean));
    return uniqueUsers.size;
  }

  /**
   * Helper: Get period key for grouping
   */
  private getPeriodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    if (groupBy === 'day') {
      return date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekNum = this.getWeekNumber(date);
      return `${date.getFullYear()}-W${weekNum}`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  /**
   * Helper: Parse period key back to date
   */
  private parsePeriodKey(periodKey: string, groupBy: 'week' | 'month'): Date {
    if (groupBy === 'week') {
      const [year, week] = periodKey.split('-W');
      const date = new Date(Number(year), 0, 1);
      date.setDate(date.getDate() + (Number(week) - 1) * 7);
      return date;
    } else {
      const [year, month] = periodKey.split('-');
      return new Date(Number(year), Number(month) - 1, 1);
    }
  }

  /**
   * Helper: Get week number
   */
  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }
}
