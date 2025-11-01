import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum EventType {
  // Page & Funnel Events
  PAGE_VIEW = 'page_view',
  PAGE_EXIT = 'page_exit',
  FUNNEL_VIEW = 'funnel_view',
  FUNNEL_STEP_VIEW = 'funnel_step_view',
  FUNNEL_STEP_COMPLETE = 'funnel_step_complete',
  FUNNEL_ABANDON = 'funnel_abandon',

  // Form & Button Events
  FORM_SUBMIT = 'form_submit',
  FORM_START = 'form_start',
  BUTTON_CLICK = 'button_click',

  // Order & Cart Events
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CART_ABANDONED = 'cart_abandoned',
  CHECKOUT_START = 'checkout_start',
  CHECKOUT_COMPLETE = 'checkout_complete',
  PURCHASE = 'purchase',
  ORDER_CREATED = 'order_created',
  ORDER_PAID = 'order_paid',
  ORDER_FAILED = 'order_failed',
  REFUND_ISSUED = 'refund_issued',

  // Upsell Events
  UPSELL_VIEW = 'upsell_view',
  UPSELL_ACCEPTED = 'upsell_accepted',
  UPSELL_DECLINED = 'upsell_declined',

  // Video Events
  VIDEO_PLAY = 'video_play',
  VIDEO_PAUSE = 'video_pause',
  VIDEO_COMPLETE = 'video_complete',
  VIDEO_PROGRESS = 'video_progress',

  // Email Events
  EMAIL_SENT = 'email_sent',
  EMAIL_DELIVERED = 'email_delivered',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  EMAIL_BOUNCED = 'email_bounced',
  EMAIL_UNSUBSCRIBED = 'email_unsubscribed',
  EMAIL_COMPLAINED = 'email_complained',

  // SMS Events
  SMS_SENT = 'sms_sent',
  SMS_RECEIVED = 'sms_received',
  SMS_CLICKED = 'sms_clicked',
  SMS_FAILED = 'sms_failed',

  // Affiliate Events
  AFFILIATE_CLICK = 'affiliate_click',
  AFFILIATE_CONVERSION = 'affiliate_conversion',
  COMMISSION_EARNED = 'commission_earned',
  COMMISSION_PAID = 'commission_paid',

  // User Events
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',

  // Subscription Events
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_PAUSED = 'subscription_paused',

  // Custom Events
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

  // Revenue Tracking
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number; // Monetary value

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string; // Currency code (e.g., 'USD')

  // UTM Parameters
  @Column({ type: 'varchar', length: 255, nullable: true })
  utmSource: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmMedium: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmCampaign: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmTerm: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmContent: string;

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

  /**
   * Check if event is a conversion event
   */
  isConversion(): boolean {
    return [
      EventType.ORDER_PAID,
      EventType.CHECKOUT_COMPLETE,
      EventType.AFFILIATE_CONVERSION,
      EventType.PURCHASE,
    ].includes(this.eventType);
  }

  /**
   * Check if event has revenue
   */
  hasRevenue(): boolean {
    return this.value !== null && this.value !== undefined && this.value > 0;
  }
}
