import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
}

export enum RecurringType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  LIFETIME = 'lifetime',
}

@Entity('commission_plans')
export class CommissionPlan extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  type: CommissionType;

  @Column({
    type: 'enum',
    enum: RecurringType,
    default: RecurringType.ONE_TIME,
  })
  recurringType: RecurringType;

  // Tier 1 (Direct referral)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tier1Rate?: number; // Percentage (0-100) or fixed amount

  // Tier 2 (Sub-affiliate)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tier2Rate?: number;

  // Tier 3 (Optional third tier)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tier3Rate?: number;

  @Column({ type: 'integer', default: 30 })
  cookieDurationDays: number;

  @Column({ type: 'integer', default: 30 })
  commissionHoldDays: number; // Days before commission is payable

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumPayout?: number;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    allowSubAffiliates?: boolean;
    requireApproval?: boolean;
    maxTierDepth?: number;
    payoutFrequency?: string; // weekly, monthly, manual
    attribution?: string; // first_click, last_click
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}
