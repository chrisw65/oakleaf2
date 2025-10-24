import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

export enum TenantPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  AGENCY = 'agency',
  ENTERPRISE = 'enterprise',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
}

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Index()
  subdomain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customDomain: string;

  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.STARTER,
  })
  plan: TenantPlan;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    faviconUrl?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
