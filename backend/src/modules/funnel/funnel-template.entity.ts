import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';
import { Funnel } from './funnel.entity';

export enum TemplateCategory {
  LEAD_GENERATION = 'lead_generation',
  SALES = 'sales',
  WEBINAR = 'webinar',
  ECOMMERCE = 'ecommerce',
  COACHING = 'coaching',
  AGENCY = 'agency',
  SAAS = 'saas',
  REAL_ESTATE = 'real_estate',
  HEALTH = 'health',
  EDUCATION = 'education',
  PRODUCT_LAUNCH = 'product_launch',
  TRIPWIRE = 'tripwire',
  MEMBERSHIP = 'membership',
  CONSULTATION = 'consultation',
  EVENT = 'event',
  OTHER = 'other',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('funnel_templates')
export class FunnelTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
  })
  @Index()
  category: TemplateCategory;

  @Column({ type: 'enum', enum: TemplateStatus, default: TemplateStatus.ACTIVE })
  @Index()
  status: TemplateStatus;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;

  @Column({ type: 'jsonb' })
  structure: {
    pages: Array<{
      name: string;
      type: string;
      content: any;
      settings: any;
    }>;
    settings: any;
    theme: any;
  };

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageConversionRate: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  industries: string[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => Funnel, (funnel) => funnel.template)
  funnels: Funnel[];
}
