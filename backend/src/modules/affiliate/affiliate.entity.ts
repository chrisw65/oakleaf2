import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';
import { CommissionPlan } from './commission-plan.entity';

export enum AffiliateStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

@Entity('affiliates')
export class Affiliate extends TenantBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  affiliateCode: string;

  @Column({ name: 'parent_affiliate_id', type: 'uuid', nullable: true })
  @Index()
  parentAffiliateId?: string;

  @Column({ name: 'commission_plan_id', type: 'uuid', nullable: true })
  @Index()
  commissionPlanId?: string;

  @Column({
    type: 'enum',
    enum: AffiliateStatus,
    default: AffiliateStatus.PENDING,
  })
  @Index()
  status: AffiliateStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pendingBalance: number;

  @Column({ type: 'integer', default: 0 })
  totalClicks: number;

  @Column({ type: 'integer', default: 0 })
  totalConversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'jsonb', default: {} })
  paymentInfo: {
    method?: string; // paypal, bank, stripe
    email?: string;
    bankAccount?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    companyName?: string;
    website?: string;
    socialMedia?: Record<string, string>;
    notes?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastPayoutAt?: Date;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Affiliate, { nullable: true })
  @JoinColumn({ name: 'parent_affiliate_id' })
  parentAffiliate?: Affiliate;

  @ManyToOne(() => CommissionPlan, { nullable: true })
  @JoinColumn({ name: 'commission_plan_id' })
  commissionPlan?: CommissionPlan;

  @OneToMany(() => Affiliate, (affiliate) => affiliate.parentAffiliate)
  subAffiliates: Affiliate[];
}
