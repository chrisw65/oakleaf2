import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PayoutMethod {
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  STRIPE = 'stripe',
  MANUAL = 'manual',
}

@Entity('payouts')
export class Payout extends TenantBaseEntity {
  @Column({ name: 'affiliate_id', type: 'uuid' })
  @Index()
  affiliateId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  @Index()
  status: PayoutStatus;

  @Column({
    type: 'enum',
    enum: PayoutMethod,
  })
  method: PayoutMethod;

  @Column({ type: 'jsonb', default: {} })
  paymentDetails: {
    email?: string;
    transactionId?: string;
    bankAccount?: string;
    reference?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: '[]' })
  commissionIds: string[]; // Array of commission IDs included in this payout

  @Column({ type: 'integer', default: 0 })
  commissionCount: number; // Number of commissions in this payout

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason?: string;
}
