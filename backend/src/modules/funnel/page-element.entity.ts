import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Page } from './page.entity';
import { User } from '../user/user.entity';

export enum ElementType {
  // Text Elements
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',

  // Media Elements
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ICON = 'icon',

  // Interactive Elements
  BUTTON = 'button',
  FORM = 'form',
  INPUT = 'input',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  SELECT = 'select',
  TEXTAREA = 'textarea',

  // Layout Elements
  CONTAINER = 'container',
  ROW = 'row',
  COLUMN = 'column',
  DIVIDER = 'divider',
  SPACER = 'spacer',

  // Advanced Elements
  COUNTDOWN = 'countdown',
  PROGRESS_BAR = 'progress_bar',
  TESTIMONIAL = 'testimonial',
  PRICING_TABLE = 'pricing_table',
  FAQ = 'faq',
  ACCORDION = 'accordion',
  TABS = 'tabs',
  CAROUSEL = 'carousel',
  GALLERY = 'gallery',
  MAP = 'map',

  // Integration Elements
  CALENDAR = 'calendar',
  CHAT = 'chat',
  SOCIAL_SHARE = 'social_share',
  SOCIAL_PROOF = 'social_proof',

  // HTML
  CUSTOM_HTML = 'custom_html',
  IFRAME = 'iframe',
}

@Entity('page_elements')
export class PageElement extends TenantBaseEntity {
  @Column({ name: 'page_id', type: 'uuid' })
  @Index()
  pageId: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'enum', enum: ElementType })
  @Index()
  elementType: ElementType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  elementId?: string; // Custom ID for targeting

  @Column({ type: 'varchar', length: 255, nullable: true })
  label?: string; // Human-readable label

  @Column({ type: 'integer', default: 0 })
  order: number; // Position in page

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string; // For nested elements (column inside row)

  // Content
  @Column({ type: 'jsonb', default: '{}' })
  content: {
    // Text elements
    text?: string;
    html?: string;

    // Media elements
    src?: string;
    alt?: string;
    caption?: string;

    // Links
    href?: string;
    target?: '_self' | '_blank';

    // Form fields
    name?: string;
    placeholder?: string;
    value?: string;
    required?: boolean;
    validation?: any;

    // Advanced elements
    countdown?: {
      endDate: Date;
      endMessage?: string;
    };

    testimonial?: {
      name: string;
      title?: string;
      company?: string;
      image?: string;
      rating?: number;
    };

    pricing?: {
      title: string;
      price: string;
      period?: string;
      features: string[];
      buttonText?: string;
      buttonLink?: string;
    };

    [key: string]: any;
  };

  // Styling
  @Column({ type: 'jsonb', default: '{}' })
  styles: {
    // Layout
    width?: string;
    height?: string;
    padding?: string;
    margin?: string;
    display?: string;
    position?: string;

    // Typography
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    lineHeight?: string;
    textAlign?: string;
    color?: string;

    // Background
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;

    // Border
    border?: string;
    borderRadius?: string;
    boxShadow?: string;

    // Effects
    opacity?: number;
    transform?: string;
    transition?: string;

    // Responsive (mobile overrides)
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;

    [key: string]: any;
  };

  // Behavior & Interactions
  @Column({ type: 'jsonb', default: '{}' })
  interactions: {
    onClick?: string; // JavaScript action
    onHover?: string;
    animation?: {
      type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
      duration?: number;
      delay?: number;
      trigger?: 'load' | 'scroll' | 'hover' | 'click';
    };
    sticky?: boolean;
    parallax?: boolean;
    [key: string]: any;
  };

  // Visibility & Conditions
  @Column({ type: 'jsonb', default: '{}' })
  visibility: {
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    hideOnDesktop?: boolean;
    showForSegments?: string[];
    showForTags?: string[];
    conditionalDisplay?: {
      field: string;
      operator: string;
      value: any;
    }[];
  };

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean; // Prevent editing

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
