import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum AutomationTrigger {
  CONTACT_CREATED = 'contact_created',
  CONTACT_UPDATED = 'contact_updated',
  TAG_ADDED = 'tag_added',
  TAG_REMOVED = 'tag_removed',
  FORM_SUBMITTED = 'form_submitted',
  ORDER_PLACED = 'order_placed',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  CART_ABANDONED = 'cart_abandoned',
  PRODUCT_PURCHASED = 'product_purchased',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  LINK_CLICKED = 'link_clicked',
  PAGE_VISITED = 'page_visited',
  AFFILIATE_SIGNUP = 'affiliate_signup',
  OPPORTUNITY_WON = 'opportunity_won',
  OPPORTUNITY_LOST = 'opportunity_lost',
}

export enum AutomationAction {
  SEND_EMAIL = 'send_email',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
  ENROLL_IN_SEQUENCE = 'enroll_in_sequence',
  REMOVE_FROM_SEQUENCE = 'remove_from_sequence',
  UPDATE_CONTACT_FIELD = 'update_contact_field',
  CREATE_TASK = 'create_task',
  SEND_WEBHOOK = 'send_webhook',
  UPDATE_LEAD_SCORE = 'update_lead_score',
  CREATE_OPPORTUNITY = 'create_opportunity',
  SEND_NOTIFICATION = 'send_notification',
}

export enum AutomationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('automation_rules')
export class AutomationRule extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: AutomationStatus, default: AutomationStatus.ACTIVE })
  @Index()
  status: AutomationStatus;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Trigger configuration
  @Column({ type: 'enum', enum: AutomationTrigger })
  @Index()
  trigger: AutomationTrigger;

  @Column({ type: 'jsonb', default: '{}' })
  triggerConditions: {
    // For tag triggers
    tagIds?: string[];

    // For form triggers
    formIds?: string[];

    // For product/order triggers
    productIds?: string[];
    orderStatus?: string[];
    orderMinAmount?: number;
    orderMaxAmount?: number;

    // For email triggers
    campaignIds?: string[];
    sequenceIds?: string[];
    linkUrls?: string[];

    // For page triggers
    pageUrls?: string[];

    // For contact triggers
    contactFields?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
      value: any;
    }>;

    // Time-based conditions
    delayMinutes?: number; // Wait X minutes after trigger

    // Additional filters
    hasTag?: string[];
    notHasTag?: string[];
  };

  // Actions configuration
  @Column({ type: 'jsonb' })
  actions: Array<{
    type: AutomationAction;
    order: number; // Execute in this order

    // For send_email action
    templateId?: string;
    subject?: string;

    // For tag actions
    tagIds?: string[];

    // For sequence actions
    sequenceId?: string;

    // For field update actions
    field?: string;
    value?: any;

    // For webhook actions
    webhookUrl?: string;
    webhookMethod?: 'GET' | 'POST';
    webhookHeaders?: Record<string, string>;
    webhookBody?: Record<string, any>;

    // For lead score actions
    scoreChange?: number; // +10, -5, etc.

    // For opportunity actions
    pipelineId?: string;
    stageId?: string;
    opportunityValue?: number;

    // For notification actions
    notificationMessage?: string;
    notificationRecipients?: string[]; // User IDs
  }>;

  // Execution settings
  @Column({ type: 'boolean', default: false })
  runOnce: boolean; // Only run once per contact

  @Column({ type: 'integer', nullable: true })
  cooldownMinutes?: number; // Minimum time between executions

  @Column({ type: 'integer', nullable: true })
  maxExecutionsPerContact?: number; // Maximum times to run for same contact

  @Column({ type: 'jsonb', default: '[0,1,2,3,4,5,6]' })
  activeDays: number[]; // Days of week when active (0=Sunday)

  @Column({ type: 'time', nullable: true })
  activeTimeStart?: string; // Start time (HH:MM)

  @Column({ type: 'time', nullable: true })
  activeTimeEnd?: string; // End time (HH:MM)

  // Statistics
  @Column({ type: 'integer', default: 0 })
  executionCount: number;

  @Column({ type: 'integer', default: 0 })
  successCount: number;

  @Column({ type: 'integer', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
