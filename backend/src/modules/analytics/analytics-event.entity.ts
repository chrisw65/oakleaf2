import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum EventType {
  PAGE_VIEW = 'page_view',
  FORM_SUBMIT = 'form_submit',
  BUTTON_CLICK = 'button_click',
  PURCHASE = 'purchase',
  UPSELL_VIEW = 'upsell_view',
  UPSELL_ACCEPTED = 'upsell_accepted',
  UPSELL_DECLINED = 'upsell_declined',
  VIDEO_PLAY = 'video_play',
  VIDEO_COMPLETE = 'video_complete',
  CART_ABANDONED = 'cart_abandoned',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  SMS_RECEIVED = 'sms_received',
  SMS_CLICKED = 'sms_clicked',
  AFFILIATE_CLICK = 'affiliate_click',
  AFFILIATE_CONVERSION = 'affiliate_conversion',
  CUSTOM = 'custom',
}

@Entity('analytics_events')
@Index(['tenantId', 'eventType', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AnalyticsEvent extends TenantBaseEntity {
  @Column({
    type: 'enum',
    enum: EventType,
  })
  @Index()
  eventType: EventType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  entityType: string; // funnel, page, email, form, etc.

  @Column({ type: 'uuid', nullable: true })
  @Index()
  entityId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  contactId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  affiliateId: string;

  @Column({ type: 'uuid', nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string; // desktop, mobile, tablet

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    value?: number;
    duration?: number;
    elementId?: string;
    elementText?: string;
    formId?: string;
    formData?: any;
    [key: string]: any;
  };
}
