import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
}

/**
 * Payment method entity for storing customer payment methods
 * Integrates with Stripe Payment Methods
 */
@Entity('payment_methods')
@Index(['tenantId', 'customerId'])
@Index(['stripePaymentMethodId'])
export class PaymentMethodEntity extends TenantBaseEntity {
  @Column()
  customerId: string; // Related customer/contact ID

  @Column({ nullable: true })
  userId?: string; // User who owns this payment method

  @Column({ unique: true })
  stripePaymentMethodId: string; // Stripe Payment Method ID

  @Column()
  stripeCustomerId: string; // Stripe Customer ID

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.CARD,
  })
  type: PaymentMethodType;

  @Column({ default: false })
  isDefault: boolean; // Default payment method for customer

  @Column({ type: 'jsonb', nullable: true })
  card?: {
    brand: string; // visa, mastercard, amex, etc.
    last4: string; // Last 4 digits
    exp_month: number;
    exp_year: number;
    fingerprint?: string; // Unique card identifier
    funding?: string; // credit, debit, prepaid, unknown
    country?: string; // Issuing country
  };

  @Column({ type: 'jsonb', nullable: true })
  bankAccount?: {
    bank_name?: string;
    last4: string;
    routing_number?: string;
    account_type?: string; // checking, savings
    country?: string;
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

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // For cards, based on exp_month/exp_year

  /**
   * Get display name for payment method
   */
  getDisplayName(): string {
    if (this.type === PaymentMethodType.CARD && this.card) {
      const brand = this.card.brand.charAt(0).toUpperCase() + this.card.brand.slice(1);
      return `${brand} •••• ${this.card.last4}`;
    }

    if (this.type === PaymentMethodType.BANK_ACCOUNT && this.bankAccount) {
      return `Bank •••• ${this.bankAccount.last4}`;
    }

    return this.type;
  }

  /**
   * Check if payment method is expired
   */
  isExpired(): boolean {
    if (this.type === PaymentMethodType.CARD && this.card) {
      const now = new Date();
      const expYear = this.card.exp_year;
      const expMonth = this.card.exp_month;

      if (now.getFullYear() > expYear) {
        return true;
      }

      if (now.getFullYear() === expYear && now.getMonth() + 1 > expMonth) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if payment method will expire soon (within 30 days)
   */
  willExpireSoon(): boolean {
    if (this.type === PaymentMethodType.CARD && this.card) {
      const now = new Date();
      const expDate = new Date(this.card.exp_year, this.card.exp_month - 1);
      const daysUntilExpiry = Math.floor(
        (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }

    return false;
  }
}
