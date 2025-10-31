import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';
import { Page } from './page.entity';
import { FunnelTemplate } from './funnel-template.entity';
import { FunnelVariant } from './funnel-variant.entity';

export enum FunnelType {
  LEAD_GENERATION = 'lead_generation',
  SALES = 'sales',
  WEBINAR = 'webinar',
  PRODUCT_LAUNCH = 'product_launch',
  MEMBERSHIP = 'membership',
  TRIPWIRE = 'tripwire',
  VSL = 'vsl', // Video Sales Letter
  APPLICATION = 'application',
  SURVEY = 'survey',
  CUSTOM = 'custom',
}

export enum FunnelStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('funnels')
export class Funnel extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FunnelStatus,
    default: FunnelStatus.DRAFT,
  })
  @Index()
  status: FunnelStatus;

  @Column({
    type: 'enum',
    enum: FunnelType,
    nullable: true,
  })
  type: FunnelType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customDomain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  favicon: string;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    seoTitle?: string;
    seoDescription?: string;
    seoImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    trackingScripts?: {
      header?: string;
      body?: string;
      footer?: string;
    };
    customCss?: string;
    customJs?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    backgroundColor?: string;
    [key: string]: any;
  };

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastEditedAt: Date;

  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ type: 'integer', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => FunnelTemplate, (template) => template.funnels, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template?: FunnelTemplate;

  @OneToMany(() => Page, (page) => page.funnel, { cascade: true })
  pages: Page[];

  @OneToMany(() => FunnelVariant, (variant) => variant.funnel)
  variants: FunnelVariant[];
}
