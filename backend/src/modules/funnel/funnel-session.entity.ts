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
import { FunnelVariant } from './funnel-variant.entity';
import { Contact } from '../crm/contact.entity';
import { FunnelEvent } from './funnel-event.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
  BOUNCED = 'bounced',
}

@Entity('funnel_sessions')
export class FunnelSession extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  @Index()
  variantId?: string;

  @ManyToOne(() => FunnelVariant, (variant) => variant.sessions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'variant_id' })
  variant?: FunnelVariant;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId?: string;

  @ManyToOne(() => Contact, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  sessionId: string; // Unique session identifier

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  @Index()
  status: SessionStatus;

  // Visitor information
  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device?: string; // 'desktop', 'mobile', 'tablet'

  @Column({ type: 'varchar', length: 255, nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  os?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  // Referral information
  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmSource?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmMedium?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmCampaign?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmContent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmTerm?: string;

  // Journey tracking
  @Column({ type: 'varchar', length: 255 })
  entryPageId: string; // Which page they entered on

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentPageId?: string; // Last page they viewed

  @Column({ type: 'varchar', length: 255, nullable: true })
  exitPageId?: string; // Page they left from

  @Column({ type: 'jsonb', default: '[]' })
  pageViews: Array<{
    pageId: string;
    viewedAt: Date;
    timeSpent: number; // seconds
  }>;

  @Column({ type: 'integer', default: 0 })
  totalPageViews: number;

  @Column({ type: 'integer', default: 0 })
  totalTimeSpent: number; // Total seconds spent in funnel

  // Conversion tracking
  @Column({ type: 'boolean', default: false })
  converted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  conversionPageId?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  conversionValue: number;

  // Behavioral flags
  @Column({ type: 'boolean', default: false })
  exitIntentShown: boolean;

  @Column({ type: 'boolean', default: false })
  exitIntentConverted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => FunnelEvent, (event) => event.session)
  events: FunnelEvent[];
}
