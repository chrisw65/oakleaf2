import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';
import { Page } from './page.entity';
import { FunnelSession } from './funnel-session.entity';

export enum VariantStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  WINNER = 'winner',
  ARCHIVED = 'archived',
}

@Entity('funnel_variants')
export class FunnelVariant extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, (funnel) => funnel.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  @Index()
  variantKey: string; // 'A', 'B', 'C', etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: VariantStatus, default: VariantStatus.ACTIVE })
  @Index()
  status: VariantStatus;

  @Column({ type: 'boolean', default: false })
  isControl: boolean; // Is this the control variant?

  @Column({ type: 'integer', default: 50 })
  trafficPercentage: number; // % of traffic allocated to this variant

  // Statistics
  @Column({ type: 'integer', default: 0 })
  visitors: number;

  @Column({ type: 'integer', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageOrderValue: number;

  @Column({ type: 'integer', default: 0 })
  bounceCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  bounceRate: number;

  @Column({ type: 'integer', default: 0 })
  averageTimeOnPage: number; // in seconds

  // Variant-specific configuration
  @Column({ type: 'jsonb', default: '{}' })
  pageOverrides: Record<string, any>; // Page-specific content overrides

  @Column({ type: 'timestamp', nullable: true })
  declaredWinnerAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => FunnelSession, (session) => session.variant)
  sessions: FunnelSession[];
}
