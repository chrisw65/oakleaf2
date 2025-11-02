import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TriggerType {
  MANUAL = 'manual',
  USER_SIGNUP = 'user_signup',
  ORDER_CREATED = 'order_created',
  CART_ABANDONED = 'cart_abandoned',
  TAG_ADDED = 'tag_added',
  FORM_SUBMITTED = 'form_submitted',
  PRODUCT_PURCHASED = 'product_purchased',
  WEBHOOK = 'webhook',
  API = 'api',
  SCHEDULED = 'scheduled',
}

/**
 * Email Sequence entity for managing automated email campaigns
 */
@Entity('email_sequences')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'triggerType'])
export class EmailSequence extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: SequenceStatus, default: SequenceStatus.DRAFT })
  status: SequenceStatus;

  // Trigger Configuration
  @Column({ type: 'enum', enum: TriggerType })
  triggerType: TriggerType;

  @Column({ type: 'jsonb', nullable: true })
  triggerConfig?: {
    tags?: string[]; // For TAG_ADDED trigger
    formId?: string; // For FORM_SUBMITTED trigger
    productIds?: string[]; // For PRODUCT_PURCHASED trigger
    schedule?: {
      startDate?: Date;
      frequency?: 'daily' | 'weekly' | 'monthly';
      time?: string; // HH:mm format
    };
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
  };

  // Sequence Steps
  @Column({ type: 'jsonb' })
  steps: Array<{
    id: string;
    type: 'email' | 'wait' | 'condition' | 'action';
    order: number;

    // Email step
    emailTemplateId?: string;
    subject?: string;
    fromName?: string;
    fromEmail?: string;

    // Wait step
    delay?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks';
    };

    // Condition step
    condition?: {
      field: string;
      operator: string;
      value: any;
      truePath?: string; // Next step ID if condition is true
      falsePath?: string; // Next step ID if condition is false
    };

    // Action step
    action?: {
      type: 'add_tag' | 'remove_tag' | 'update_field' | 'webhook' | 'end_sequence';
      config?: Record<string, any>;
    };

    metadata?: Record<string, any>;
  }>;

  // Goal Configuration
  @Column({ type: 'varchar', length: 100, nullable: true })
  goalType?: string; // e.g., 'email_opened', 'link_clicked', 'product_purchased'

  @Column({ type: 'jsonb', nullable: true })
  goalConfig?: Record<string, any>;

  // Settings
  @Column({ default: true })
  exitOnGoalAchieved: boolean; // Remove subscriber from sequence when goal is achieved

  @Column({ default: false })
  allowReentry: boolean; // Allow users to re-enter sequence

  @Column({ type: 'int', nullable: true })
  maxSubscribers?: number; // Maximum number of active subscribers

  // Statistics
  @Column({ type: 'int', default: 0 })
  totalSubscribers: number;

  @Column({ type: 'int', default: 0 })
  activeSubscribers: number;

  @Column({ type: 'int', default: 0 })
  completedSubscribers: number;

  @Column({ type: 'int', default: 0 })
  totalEmailsSent: number;

  // Metadata
  @Column({ nullable: true })
  createdBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Check if sequence is active
   */
  isActive(): boolean {
    return this.status === SequenceStatus.ACTIVE;
  }

  /**
   * Check if sequence has capacity for new subscribers
   */
  hasCapacity(): boolean {
    if (!this.maxSubscribers) {
      return true;
    }
    return this.activeSubscribers < this.maxSubscribers;
  }

  /**
   * Get total number of steps
   */
  getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Get email steps only
   */
  getEmailSteps() {
    return this.steps.filter((s) => s.type === 'email');
  }

  /**
   * Get next step after current step
   */
  getNextStep(currentStepId: string, conditionResult?: boolean): any {
    const currentStep = this.steps.find((s) => s.id === currentStepId);
    if (!currentStep) {
      return null;
    }

    // Handle conditional branching
    if (currentStep.type === 'condition' && currentStep.condition) {
      const nextStepId = conditionResult
        ? currentStep.condition.truePath
        : currentStep.condition.falsePath;
      return this.steps.find((s) => s.id === nextStepId);
    }

    // Get next step by order
    const nextOrder = currentStep.order + 1;
    return this.steps.find((s) => s.order === nextOrder);
  }

  /**
   * Increment subscriber counts
   */
  incrementSubscriber(): void {
    this.totalSubscribers += 1;
    this.activeSubscribers += 1;
  }

  /**
   * Complete subscriber
   */
  completeSubscriber(): void {
    this.activeSubscribers = Math.max(0, this.activeSubscribers - 1);
    this.completedSubscribers += 1;
  }

  /**
   * Remove subscriber
   */
  removeSubscriber(): void {
    this.activeSubscribers = Math.max(0, this.activeSubscribers - 1);
  }

  /**
   * Increment email sent count
   */
  incrementEmailSent(): void {
    this.totalEmailsSent += 1;
    this.lastRunAt = new Date();
  }
}
