import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';

export enum GoalType {
  PAGE_VISIT = 'page_visit',
  FORM_SUBMISSION = 'form_submission',
  BUTTON_CLICK = 'button_click',
  TIME_ON_SITE = 'time_on_site',
  PURCHASE = 'purchase',
  REVENUE_TARGET = 'revenue_target',
  EMAIL_SIGNUP = 'email_signup',
  VIDEO_WATCH = 'video_watch',
  DOWNLOAD = 'download',
  CUSTOM_EVENT = 'custom_event',
}

export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('funnel_goals')
export class FunnelGoal extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: GoalType })
  @Index()
  type: GoalType;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  @Index()
  status: GoalStatus;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Is this the main conversion goal?

  // Goal configuration
  @Column({ type: 'jsonb', default: '{}' })
  config: {
    // For page visit goals
    targetPageId?: string;

    // For form submission goals
    formId?: string;

    // For button click goals
    buttonId?: string;
    buttonText?: string;

    // For time on site goals
    minimumSeconds?: number;

    // For purchase goals
    minimumOrderValue?: number;
    productIds?: string[];

    // For revenue target goals
    targetRevenue?: number;

    // For video watch goals
    videoId?: string;
    watchPercentage?: number; // e.g., 75 for 75% watched

    // For custom event goals
    eventName?: string;
    eventProperties?: Record<string, any>;
  };

  // Value assignment
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number; // Monetary value of this goal

  // Analytics
  @Column({ type: 'integer', default: 0 })
  completionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number; // % of visitors who complete this goal

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number; // Sum of all completions * value

  @Column({ type: 'integer', default: 0 })
  averageTimeToComplete: number; // Average seconds to complete

  @Column({ type: 'jsonb', default: '[]' })
  completionsByDate: Array<{
    date: string;
    count: number;
    value: number;
  }>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
