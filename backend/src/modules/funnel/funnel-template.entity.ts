import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

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
  OTHER = 'other',
}

@Entity('funnel_templates')
export class FunnelTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
  })
  @Index()
  category: TemplateCategory;

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

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  industries: string[];
}
