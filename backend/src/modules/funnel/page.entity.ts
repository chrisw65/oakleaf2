import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';

export enum PageType {
  OPT_IN = 'opt_in',
  SALES = 'sales',
  UPSELL = 'upsell',
  DOWNSELL = 'downsell',
  THANK_YOU = 'thank_you',
  CHECKOUT = 'checkout',
  ORDER_CONFIRMATION = 'order_confirmation',
  WEBINAR_REGISTRATION = 'webinar_registration',
  WEBINAR_REPLAY = 'webinar_replay',
  LANDING = 'landing',
  SURVEY = 'survey',
  APPLICATION = 'application',
  MEMBERSHIP = 'membership',
  CUSTOM = 'custom',
}

@Entity('pages')
export class Page extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PageType,
    default: PageType.LANDING,
  })
  type: PageType;

  @Column({ type: 'integer', default: 0 })
  @Index()
  position: number;

  @Column({ type: 'jsonb' })
  content: {
    components: any[];
    version?: string;
    lastModified?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  seoSettings: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    robots?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  styles: {
    backgroundColor?: string;
    backgroundImage?: string;
    customCss?: string;
    mobileStyles?: any;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: {
    showNavigation?: boolean;
    showFooter?: boolean;
    redirectUrl?: string;
    redirectDelay?: number;
    popupSettings?: any;
    trackingPixels?: string[];
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail: string;

  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ type: 'integer', default: 0 })
  submissions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  // A/B Testing
  @Column({ type: 'boolean', default: false })
  isVariant: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentPageId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  variantName: string;

  @Column({ type: 'integer', default: 50 })
  trafficSplit: number; // Percentage 0-100

  // Relations
  @ManyToOne(() => Funnel, (funnel) => funnel.pages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;
}
