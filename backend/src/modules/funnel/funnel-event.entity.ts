import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Funnel } from './funnel.entity';
import { FunnelSession } from './funnel-session.entity';

export enum EventType {
  PAGE_VIEW = 'page_view',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  VIDEO_PLAY = 'video_play',
  VIDEO_COMPLETE = 'video_complete',
  DOWNLOAD = 'download',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT_STARTED = 'checkout_started',
  PURCHASE = 'purchase',
  EXIT_INTENT = 'exit_intent',
  SCROLL_DEPTH = 'scroll_depth',
  TIME_ON_PAGE = 'time_on_page',
  CUSTOM_EVENT = 'custom_event',
  CONVERSION_GOAL = 'conversion_goal',
}

@Entity('funnel_events')
export class FunnelEvent extends TenantBaseEntity {
  @Column({ name: 'funnel_id', type: 'uuid' })
  @Index()
  funnelId: string;

  @ManyToOne(() => Funnel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'funnel_id' })
  funnel: Funnel;

  @Column({ name: 'session_id', type: 'uuid' })
  @Index()
  sessionId: string;

  @ManyToOne(() => FunnelSession, (session) => session.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: FunnelSession;

  @Column({ type: 'enum', enum: EventType })
  @Index()
  eventType: EventType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  eventName?: string; // Custom event name

  @Column({ type: 'varchar', length: 255, nullable: true })
  pageId?: string; // Which page the event occurred on

  @Column({ type: 'varchar', length: 255, nullable: true })
  elementId?: string; // ID of the element that triggered the event

  @Column({ type: 'varchar', length: 255, nullable: true })
  elementType?: string; // button, link, form, etc.

  @Column({ type: 'varchar', length: 500, nullable: true })
  elementText?: string; // Text content of the element

  // Event-specific data
  @Column({ type: 'jsonb', default: '{}' })
  eventData: {
    // For form submits
    formData?: Record<string, any>;

    // For video events
    videoUrl?: string;
    videoProgress?: number;
    videoDuration?: number;

    // For scroll events
    scrollDepth?: number; // percentage

    // For time on page
    timeSpent?: number; // seconds

    // For purchases
    orderValue?: number;
    orderId?: string;
    productIds?: string[];

    // For custom events
    customProperties?: Record<string, any>;
  };

  // Conversion tracking
  @Column({ type: 'boolean', default: false })
  isConversion: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  conversionValue: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  goalId?: string; // Reference to conversion goal if applicable

  // Timing
  @Column({ type: 'timestamp' })
  eventTime: Date;

  @Column({ type: 'integer', nullable: true })
  timeFromStart?: number; // Time from session start in seconds

  @Column({ type: 'integer', nullable: true })
  timeFromLastEvent?: number; // Time from previous event in seconds

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
