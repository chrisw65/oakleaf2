import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
  OTHER = 'other',
}

export enum Currency {
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp',
  CAD = 'cad',
  AUD = 'aud',
}

/**
 * Payment entity for tracking all payment transactions
 * Integrates with Stripe for payment processing
 */
@Entity('payments')
@Index(['tenantId', 'status'])
@Index(['orderId'])
@Index(['stripePaymentIntentId'])
export class Payment extends TenantBaseEntity {
  @Column()
  orderId: string; // Related order ID

  @Column({ nullable: true })
  customerId?: string; // Related customer/contact ID

  @Column({ nullable: true })
  userId?: string; // User who initiated payment

  @Column({ nullable: true })
  subscriptionId?: string; // Related subscription ID (if recurring)

  @Column({ unique: true })
  stripePaymentIntentId: string; // Stripe Payment Intent ID

  @Column({ nullable: true })
  stripeChargeId?: string; // Stripe Charge ID (when payment succeeds)

  @Column({ nullable: true })
  stripeCustomerId?: string; // Stripe Customer ID

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Total amount in currency

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountRefunded: number; // Amount refunded

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  applicationFeeAmount?: number; // Platform fee (for marketplace)

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    funnelId?: string;
    productId?: string;
    affiliateId?: string;
    couponCode?: string;
    [key: string]: any;
  };

  @Column({ nullable: true })
  receiptUrl?: string; // Stripe receipt URL

  @Column({ nullable: true })
  receiptEmail?: string; // Email to send receipt to

  @Column({ nullable: true })
  failureCode?: string; // Stripe failure code

  @Column({ type: 'text', nullable: true })
  failureMessage?: string; // Human-readable failure message

  @Column({ type: 'jsonb', nullable: true })
  paymentMethodDetails?: {
    type?: string;
    card?: {
      brand?: string;
      last4?: string;
      exp_month?: number;
      exp_year?: number;
    };
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };

  @Column({ nullable: true })
  stripeRefundId?: string; // If refunded

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date; // When payment was completed

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date; // When refund was issued

  @Column({ type: 'timestamp', nullable: true })
  canceledAt?: Date; // When payment was canceled

  @Column({ default: false })
  isTest: boolean; // Test mode payment

  /**
   * Check if payment is successful
   */
  isSuccessful(): boolean {
    return this.status === PaymentStatus.SUCCEEDED;
  }

  /**
   * Check if payment can be refunded
   */
  canRefund(): boolean {
    return (
      this.status === PaymentStatus.SUCCEEDED &&
      this.amountRefunded < this.amount
    );
  }

  /**
   * Get refundable amount
   */
  getRefundableAmount(): number {
    return this.amount - this.amountRefunded;
  }

  /**
   * Check if fully refunded
   */
  isFullyRefunded(): boolean {
    return this.amountRefunded >= this.amount;
  }
}
