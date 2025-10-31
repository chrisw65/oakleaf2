import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';

export enum SuggestionType {
  CONVERSION_OPTIMIZATION = 'conversion_optimization',
  TRAFFIC_IMPROVEMENT = 'traffic_improvement',
  CONTENT_RECOMMENDATION = 'content_recommendation',
  DESIGN_IMPROVEMENT = 'design_improvement',
  TIMING_OPTIMIZATION = 'timing_optimization',
  AUDIENCE_TARGETING = 'audience_targeting',
  AB_TEST_RECOMMENDATION = 'ab_test_recommendation',
  BOTTLENECK_FIX = 'bottleneck_fix',
  EXIT_INTENT_STRATEGY = 'exit_intent_strategy',
  FOLLOW_UP_SEQUENCE = 'follow_up_sequence',
}

export enum SuggestionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SuggestionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DISMISSED = 'dismissed',
  IMPLEMENTED = 'implemented',
}

@Entity('funnel_suggestions')
export class FunnelSuggestion extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ type: 'enum', enum: SuggestionType })
  @Index()
  type: SuggestionType;

  @Column({ type: 'enum', enum: SuggestionPriority, default: SuggestionPriority.MEDIUM })
  @Index()
  priority: SuggestionPriority;

  @Column({ type: 'enum', enum: SuggestionStatus, default: SuggestionStatus.PENDING })
  @Index()
  status: SuggestionStatus;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  reasoning?: string; // Why this suggestion was made (AI reasoning)

  // Impact estimation
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedImpact?: number; // Estimated % improvement

  @Column({ type: 'varchar', length: 255, nullable: true })
  impactMetric?: string; // What metric will improve (conversion_rate, revenue, etc.)

  // Implementation details
  @Column({ type: 'jsonb', default: '[]' })
  actionSteps: Array<{
    step: number;
    action: string;
    details?: string;
  }>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetPageId?: string; // Specific page this suggestion applies to

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetElementId?: string; // Specific element this suggestion applies to

  // Analytics that triggered the suggestion
  @Column({ type: 'jsonb', default: '{}' })
  triggeringData: {
    conversionRate?: number;
    bounceRate?: number;
    averageTimeOnPage?: number;
    dropoffRate?: number;
    sampleSize?: number;
    [key: string]: any;
  };

  // Implementation tracking
  @Column({ type: 'timestamp', nullable: true })
  implementedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  implementedBy?: string; // User ID who implemented

  @Column({ type: 'jsonb', default: '{}' })
  implementationResults: {
    beforeMetrics?: Record<string, number>;
    afterMetrics?: Record<string, number>;
    actualImpact?: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dismissalReason?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
