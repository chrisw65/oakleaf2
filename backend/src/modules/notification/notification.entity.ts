import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum NotificationType {
  // System
  SYSTEM = 'system',

  // Orders & Payments
  ORDER_CREATED = 'order_created',
  ORDER_COMPLETED = 'order_completed',
  PAYMENT_SUCCEEDED = 'payment_succeeded',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_ISSUED = 'refund_issued',

  // Subscriptions
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed',

  // Contacts & CRM
  CONTACT_CREATED = 'contact_created',
  CONTACT_UPDATED = 'contact_updated',
  FORM_SUBMITTED = 'form_submitted',

  // Email
  EMAIL_SENT = 'email_sent',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  EMAIL_BOUNCED = 'email_bounced',

  // Affiliates
  AFFILIATE_JOINED = 'affiliate_joined',
  COMMISSION_EARNED = 'commission_earned',
  COMMISSION_PAID = 'commission_paid',

  // Webhooks
  WEBHOOK_FAILED = 'webhook_failed',

  // Files
  FILE_UPLOADED = 'file_uploaded',
  FILE_PROCESSED = 'file_processed',

  // Users & Teams
  USER_INVITED = 'user_invited',
  USER_JOINED = 'user_joined',
  ROLE_CHANGED = 'role_changed',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Notification entity for real-time and persistent notifications
 */
@Entity('notifications')
@Index(['tenantId', 'userId', 'isRead'])
@Index(['type'])
export class Notification extends TenantBaseEntity {
  @Column()
  @Index()
  userId: string; // Recipient user ID

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  actionUrl?: string; // URL to navigate to when clicked

  @Column({ nullable: true })
  actionLabel?: string; // Label for action button

  @Column({ nullable: true })
  icon?: string; // Icon name or emoji

  @Column({ nullable: true })
  color?: string; // UI color (success, warning, error, info)

  @Column({ type: 'jsonb', nullable: true })
  data?: {
    resourceType?: string; // e.g., 'order', 'payment', 'contact'
    resourceId?: string; // ID of related resource
    [key: string]: any;
  };

  @Column({ nullable: true })
  groupKey?: string; // For grouping similar notifications

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // Auto-delete after this date

  @Column({ default: false })
  isSent: boolean; // Sent via real-time channel

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  /**
   * Mark as read
   */
  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }

  /**
   * Check if notification is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * Get notification age in minutes
   */
  getAgeInMinutes(): number {
    const now = new Date();
    const created = this.createdAt;
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
  }
}
