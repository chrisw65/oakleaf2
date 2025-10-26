import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Affiliate } from './affiliate.entity';

export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

@Entity('commissions')
export class Commission extends TenantBaseEntity {
  @Column({ name: 'affiliate_id', type: 'uuid' })
  @Index()
  affiliateId: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  @Index()
  orderId?: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId?: string;

  @Column({ type: 'integer', default: 1 })
  tier: number; // 1 = direct, 2 = sub-affiliate, 3 = third tier

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  orderAmount?: number; // Total order amount

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate?: number; // Percentage used for calculation

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  @Index()
  status: CommissionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    productId?: string;
    productName?: string;
    funnelId?: string;
    funnelName?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  payableAt?: Date; // When commission becomes payable (after hold period)

  @Column({ name: 'payout_id', type: 'uuid', nullable: true })
  @Index()
  payoutId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Affiliate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: Affiliate;
}
