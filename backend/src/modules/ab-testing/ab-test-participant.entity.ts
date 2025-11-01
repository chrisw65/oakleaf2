import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

/**
 * A/B Test Participant entity for tracking variant assignments
 */
@Entity('ab_test_participants')
@Index(['tenantId', 'testId', 'userId'])
@Index(['testId', 'variantId'])
@Index(['sessionId'])
export class ABTestParticipant extends TenantBaseEntity {
  @Column()
  testId: string;

  @Column()
  variantId: string;

  @Column({ nullable: true })
  userId?: string; // User ID if logged in

  @Column()
  sessionId: string; // Session ID for anonymous users

  // Tracking
  @Column({ type: 'timestamp' })
  assignedAt: Date;

  @Column({ default: false })
  converted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  conversionValue?: number; // Revenue or other value metric

  // Engagement Tracking
  @Column({ type: 'int', default: 0 })
  interactions: number;

  @Column({ type: 'int', nullable: true })
  timeSpent?: number; // Time spent in seconds

  @Column({ type: 'jsonb', nullable: true })
  events?: Array<{
    type: string;
    timestamp: Date;
    data?: Record<string, any>;
  }>;

  // Context
  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  browser?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Track conversion
   */
  markAsConverted(value?: number): void {
    this.converted = true;
    this.convertedAt = new Date();
    if (value !== undefined) {
      this.conversionValue = value;
    }
  }

  /**
   * Add interaction event
   */
  addEvent(type: string, data?: Record<string, any>): void {
    if (!this.events) {
      this.events = [];
    }
    this.events.push({
      type,
      timestamp: new Date(),
      data,
    });
    this.interactions += 1;
  }
}
