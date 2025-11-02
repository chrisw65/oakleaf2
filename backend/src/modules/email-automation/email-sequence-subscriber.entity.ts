import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum SubscriberStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
  FAILED = 'failed',
}

/**
 * Email Sequence Subscriber entity for tracking users in sequences
 */
@Entity('email_sequence_subscribers')
@Index(['tenantId', 'sequenceId', 'status'])
@Index(['tenantId', 'userId'])
@Index(['nextSendAt'])
export class EmailSequenceSubscriber extends TenantBaseEntity {
  @Column()
  sequenceId: string;

  @Column()
  userId: string; // Contact/User being automated

  @Column({ type: 'enum', enum: SubscriberStatus, default: SubscriberStatus.ACTIVE })
  status: SubscriberStatus;

  // Progress Tracking
  @Column({ nullable: true })
  currentStepId?: string;

  @Column({ type: 'int', default: 0 })
  currentStepIndex: number;

  @Column({ type: 'timestamp' })
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextSendAt?: Date; // When to process next step

  @Column({ type: 'timestamp', nullable: true })
  lastEmailSentAt?: Date;

  // Engagement Tracking
  @Column({ type: 'int', default: 0 })
  emailsSent: number;

  @Column({ type: 'int', default: 0 })
  emailsOpened: number;

  @Column({ type: 'int', default: 0 })
  emailsClicked: number;

  @Column({ type: 'int', default: 0 })
  emailsBounced: number;

  @Column({ type: 'jsonb', nullable: true })
  engagementData?: Array<{
    stepId: string;
    sentAt: Date;
    openedAt?: Date;
    clickedAt?: Date;
    linkClicked?: string;
  }>;

  // Goal Tracking
  @Column({ default: false })
  goalAchieved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  goalAchievedAt?: Date;

  // Context Data
  @Column({ type: 'jsonb', nullable: true })
  enrollmentData?: Record<string, any>; // Data at time of enrollment

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>; // Custom fields for personalization

  // Error Tracking
  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt?: Date;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  /**
   * Check if subscriber is active
   */
  isActive(): boolean {
    return this.status === SubscriberStatus.ACTIVE;
  }

  /**
   * Check if subscriber is ready for next step
   */
  isReadyForNextStep(): boolean {
    if (!this.isActive()) {
      return false;
    }

    if (!this.nextSendAt) {
      return true; // No delay configured
    }

    return new Date() >= this.nextSendAt;
  }

  /**
   * Mark email as sent
   */
  markEmailSent(stepId: string): void {
    this.emailsSent += 1;
    this.lastEmailSentAt = new Date();

    if (!this.engagementData) {
      this.engagementData = [];
    }

    this.engagementData.push({
      stepId,
      sentAt: new Date(),
    });
  }

  /**
   * Mark email as opened
   */
  markEmailOpened(stepId: string): void {
    this.emailsOpened += 1;

    if (this.engagementData) {
      const engagement = this.engagementData.find((e) => e.stepId === stepId);
      if (engagement && !engagement.openedAt) {
        engagement.openedAt = new Date();
      }
    }
  }

  /**
   * Mark email link as clicked
   */
  markEmailClicked(stepId: string, linkUrl?: string): void {
    this.emailsClicked += 1;

    if (this.engagementData) {
      const engagement = this.engagementData.find((e) => e.stepId === stepId);
      if (engagement && !engagement.clickedAt) {
        engagement.clickedAt = new Date();
        engagement.linkClicked = linkUrl;
      }
    }
  }

  /**
   * Mark email as bounced
   */
  markEmailBounced(): void {
    this.emailsBounced += 1;
    if (this.emailsBounced >= 3) {
      this.status = SubscriberStatus.BOUNCED;
    }
  }

  /**
   * Move to next step
   */
  moveToNextStep(stepId: string, stepIndex: number, delay?: { value: number; unit: string }): void {
    this.currentStepId = stepId;
    this.currentStepIndex = stepIndex;

    if (delay) {
      const delayMs = this.calculateDelayMs(delay.value, delay.unit);
      this.nextSendAt = new Date(Date.now() + delayMs);
    } else {
      this.nextSendAt = undefined;
    }
  }

  /**
   * Mark as completed
   */
  markCompleted(): void {
    this.status = SubscriberStatus.COMPLETED;
    this.completedAt = new Date();
  }

  /**
   * Mark goal as achieved
   */
  markGoalAchieved(): void {
    this.goalAchieved = true;
    this.goalAchievedAt = new Date();
  }

  /**
   * Record error
   */
  recordError(error: string): void {
    this.lastError = error;
    this.lastErrorAt = new Date();
    this.errorCount += 1;

    if (this.errorCount >= 5) {
      this.status = SubscriberStatus.FAILED;
    }
  }

  /**
   * Calculate delay in milliseconds
   */
  private calculateDelayMs(value: number, unit: string): number {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || 0);
  }

  /**
   * Get engagement rate
   */
  getEngagementRate(): number {
    if (this.emailsSent === 0) {
      return 0;
    }
    return (this.emailsOpened / this.emailsSent) * 100;
  }

  /**
   * Get click-through rate
   */
  getClickThroughRate(): number {
    if (this.emailsOpened === 0) {
      return 0;
    }
    return (this.emailsClicked / this.emailsOpened) * 100;
  }
}
