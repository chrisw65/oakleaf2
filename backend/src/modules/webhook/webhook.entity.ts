import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';
import { WebhookAttempt } from './webhook-attempt.entity';

export enum WebhookEvent {
  // Funnel events
  FUNNEL_CREATED = 'funnel.created',
  FUNNEL_UPDATED = 'funnel.updated',
  FUNNEL_DELETED = 'funnel.deleted',

  // Contact events
  CONTACT_CREATED = 'contact.created',
  CONTACT_UPDATED = 'contact.updated',
  CONTACT_DELETED = 'contact.deleted',
  CONTACT_TAGGED = 'contact.tagged',

  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_COMPLETED = 'order.completed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_REFUNDED = 'order.refunded',

  // Form events
  FORM_SUBMITTED = 'form.submitted',

  // Email events
  EMAIL_SENT = 'email.sent',
  EMAIL_OPENED = 'email.opened',
  EMAIL_CLICKED = 'email.clicked',
  EMAIL_BOUNCED = 'email.bounced',
  EMAIL_UNSUBSCRIBED = 'email.unsubscribed',

  // Subscription events
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SUBSCRIPTION_PAYMENT_SUCCEEDED = 'subscription.payment_succeeded',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription.payment_failed',

  // Affiliate events
  AFFILIATE_CREATED = 'affiliate.created',
  AFFILIATE_COMMISSION_EARNED = 'affiliate.commission_earned',
  AFFILIATE_COMMISSION_PAID = 'affiliate.commission_paid',

  // Custom event
  CUSTOM = 'custom',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISABLED = 'disabled', // Disabled due to too many failures
}

@Entity('webhooks')
export class Webhook extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description?: string;

  @Column({ type: 'varchar', length: 500 })
  @Index()
  url: string;

  @Column({ type: 'simple-array' })
  @Index()
  events: WebhookEvent[];

  @Column({ type: 'enum', enum: WebhookStatus, default: WebhookStatus.ACTIVE })
  @Index()
  status: WebhookStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret?: string; // For HMAC signature verification

  @Column({ type: 'jsonb', default: '{}' })
  headers: Record<string, string>; // Custom headers to send

  @Column({ type: 'jsonb', default: '{}' })
  filters: {
    // Filter by specific conditions
    funnelIds?: string[];
    productIds?: string[];
    tags?: string[];
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };

  @Column({ type: 'integer', default: 3 })
  maxRetries: number;

  @Column({ type: 'integer', default: 5000 })
  timeoutMs: number; // Request timeout in milliseconds

  @Column({ type: 'boolean', default: true })
  verifySSL: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @Index()
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Statistics
  @Column({ type: 'integer', default: 0 })
  totalAttempts: number;

  @Column({ type: 'integer', default: 0 })
  successfulAttempts: number;

  @Column({ type: 'integer', default: 0 })
  failedAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt?: Date;

  @Column({ type: 'integer', default: 0 })
  consecutiveFailures: number;

  @OneToMany(() => WebhookAttempt, (attempt) => attempt.webhook)
  attempts: WebhookAttempt[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
