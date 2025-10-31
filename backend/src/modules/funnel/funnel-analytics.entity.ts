import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';

export enum AnalyticsPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('funnel_analytics')
export class FunnelAnalytics extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ type: 'enum', enum: AnalyticsPeriod })
  @Index()
  period: AnalyticsPeriod;

  @Column({ type: 'date' })
  @Index()
  periodDate: Date; // The date/hour this analytics record represents

  @Column({ type: 'varchar', length: 255, nullable: true })
  variantId?: string; // Optional: analytics for specific variant

  // Traffic metrics
  @Column({ type: 'integer', default: 0 })
  visitors: number;

  @Column({ type: 'integer', default: 0 })
  uniqueVisitors: number;

  @Column({ type: 'integer', default: 0 })
  pageViews: number;

  @Column({ type: 'integer', default: 0 })
  bounces: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  bounceRate: number;

  @Column({ type: 'integer', default: 0 })
  averageTimeOnSite: number; // seconds

  // Conversion metrics
  @Column({ type: 'integer', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  // Source breakdown
  @Column({ type: 'jsonb', default: '{}' })
  sourceBreakdown: {
    direct?: number;
    organic?: number;
    social?: number;
    email?: number;
    paid?: number;
    referral?: number;
  };

  // Device breakdown
  @Column({ type: 'jsonb', default: '{}' })
  deviceBreakdown: {
    desktop?: number;
    mobile?: number;
    tablet?: number;
  };

  // Page-level analytics
  @Column({ type: 'jsonb', default: '[]' })
  pageAnalytics: Array<{
    pageId: string;
    views: number;
    uniqueVisitors: number;
    averageTimeOnPage: number;
    dropoffRate: number;
    conversions: number;
  }>;

  // Funnel drop-off points
  @Column({ type: 'jsonb', default: '[]' })
  dropoffPoints: Array<{
    fromPageId: string;
    toPageId: string;
    dropoffs: number;
    dropoffRate: number;
  }>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

// Composite index for efficient time-series queries
@Index(['tenantId', 'funnelId', 'period', 'periodDate'])
export class FunnelAnalyticsIndexes {}
