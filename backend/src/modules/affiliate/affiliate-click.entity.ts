import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Affiliate } from './affiliate.entity';

@Entity('affiliate_clicks')
export class AffiliateClick extends TenantBaseEntity {
  @Column({ name: 'affiliate_id', type: 'uuid' })
  @Index()
  affiliateId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  visitorId: string; // Cookie/session ID

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  landingPage?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'jsonb', default: {} })
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  converted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt?: Date;

  // Relations
  @ManyToOne(() => Affiliate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_id' })
  affiliate: Affiliate;
}
