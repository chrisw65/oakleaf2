import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAUSED = 'paused',
}

export enum SubscriptionInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * Subscription entity for recurring payment subscriptions
 * Integrates with Stripe Subscriptions
 */
@Entity('subscriptions')
@Index(['tenantId', 'status'])
@Index(['customerId'])
@Index(['stripeSubscriptionId'])
export class Subscription extends TenantBaseEntity {
  @Column()
  customerId: string; // Related customer/contact ID

  @Column({ nullable: true })
  userId?: string; // User who owns subscription

  @Column({ unique: true })
  stripeSubscriptionId: string; // Stripe Subscription ID

  @Column()
  stripeCustomerId: string; // Stripe Customer ID

  @Column({ nullable: true })
  stripePriceId?: string; // Stripe Price ID

  @Column({ nullable: true })
  stripeProductId?: string; // Stripe Product ID

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  @Index()
  status: SubscriptionStatus;

  @Column({ nullable: true })
  productId?: string; // Internal product ID

  @Column()
  planName: string; // Subscription plan name

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SubscriptionInterval,
    default: SubscriptionInterval.MONTH,
  })
  interval: SubscriptionInterval;

  @Column({ default: 1 })
  intervalCount: number; // e.g., 3 for "every 3 months"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Recurring amount

  @Column({ default: 'usd' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  trialAmount?: number; // Trial period amount (if any)

  @Column({ type: 'int', nullable: true })
  trialDays?: number; // Trial period in days

  @Column({ type: 'timestamp', nullable: true })
  trialStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  trialEnd?: Date;

  @Column({ type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelAt?: Date; // Scheduled cancellation date

  @Column({ default: false })
  cancelAtPeriodEnd: boolean; // Cancel at end of billing period

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    funnelId?: string;
    affiliateId?: string;
    [key: string]: any;
  };

  @Column({ default: 0 })
  quantity: number; // Quantity of subscription items

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent?: number; // Discount percentage

  @Column({ nullable: true })
  couponCode?: string;

  @Column({ nullable: true })
  lastPaymentId?: string; // Last successful payment ID

  @Column({ type: 'timestamp', nullable: true })
  lastPaymentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextPaymentAt?: Date; // Next billing date

  @Column({ default: 0 })
  failedPaymentCount: number; // Count of failed payments

  @Column({ default: false })
  isPaused: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pausedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  resumedAt?: Date;

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE ||
      this.status === SubscriptionStatus.TRIALING
    );
  }

  /**
   * Check if in trial period
   */
  isTrialing(): boolean {
    if (!this.trialEnd) {
      return false;
    }
    return this.status === SubscriptionStatus.TRIALING && this.trialEnd > new Date();
  }

  /**
   * Check if subscription is canceled
   */
  isCanceled(): boolean {
    return (
      this.status === SubscriptionStatus.CANCELED ||
      this.canceledAt !== null ||
      this.endedAt !== null
    );
  }

  /**
   * Get days until next payment
   */
  getDaysUntilNextPayment(): number | null {
    if (!this.nextPaymentAt) {
      return null;
    }

    const now = new Date();
    const diff = this.nextPaymentAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(): number | null {
    if (!this.isTrialing() || !this.trialEnd) {
      return null;
    }

    const now = new Date();
    const diff = this.trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
