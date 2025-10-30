import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Page } from './page.entity';

export enum PopupTrigger {
  EXIT_INTENT = 'exit_intent',
  TIME_DELAY = 'time_delay',
  SCROLL_PERCENTAGE = 'scroll_percentage',
  CLICK_ELEMENT = 'click_element',
  MANUAL = 'manual',
}

export enum PopupType {
  MODAL = 'modal',
  SLIDE_IN = 'slide_in',
  BANNER = 'banner',
  FULLSCREEN = 'fullscreen',
  EMBEDDED = 'embedded',
}

export enum PopupAnimation {
  FADE = 'fade',
  SLIDE_UP = 'slide_up',
  SLIDE_DOWN = 'slide_down',
  ZOOM = 'zoom',
  NONE = 'none',
}

@Entity('page_popups')
export class PagePopup extends TenantBaseEntity {
  @Column({ name: 'page_id', type: 'uuid', nullable: true })
  @Index()
  pageId?: string; // Null = global popup

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page?: Page;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: PopupType })
  @Index()
  popupType: PopupType;

  @Column({ type: 'enum', enum: PopupTrigger })
  trigger: PopupTrigger;

  @Column({ type: 'jsonb', default: '{}' })
  triggerConfig: {
    delay?: number; // seconds for time_delay
    scrollPercentage?: number; // % for scroll trigger
    elementSelector?: string; // for click_element
    showOnce?: boolean; // Show only once per visitor
    frequency?: 'once' | 'session' | 'always';
  };

  @Column({ type: 'enum', enum: PopupAnimation, default: PopupAnimation.FADE })
  animation: PopupAnimation;

  @Column({ type: 'jsonb' })
  content: {
    title?: string;
    description?: string;
    html?: string;
    formId?: string; // Link to a form
    imageUrl?: string;
    videoUrl?: string;
    ctaText?: string;
    ctaLink?: string;
  };

  @Column({ type: 'jsonb', default: '{}' })
  styles: {
    width?: string;
    maxWidth?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    padding?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };

  @Column({ type: 'boolean', default: true })
  showCloseButton: boolean;

  @Column({ type: 'boolean', default: true })
  closeOnOverlayClick: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  order: number;

  // Analytics
  @Column({ type: 'integer', default: 0 })
  impressions: number;

  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ type: 'integer', default: 0 })
  interactions: number; // clicks, form submits, etc.

  @Column({ type: 'integer', default: 0 })
  conversions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
