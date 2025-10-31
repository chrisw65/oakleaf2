import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum ThemeCategory {
  BUSINESS = 'business',
  ECOMMERCE = 'ecommerce',
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  REAL_ESTATE = 'real_estate',
  SAAS = 'saas',
  AGENCY = 'agency',
  PERSONAL = 'personal',
  EVENT = 'event',
  NONPROFIT = 'nonprofit',
  OTHER = 'other',
}

export enum ThemeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('page_themes')
export class PageTheme extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ThemeCategory, default: ThemeCategory.BUSINESS })
  @Index()
  category: ThemeCategory;

  @Column({ type: 'enum', enum: ThemeStatus, default: ThemeStatus.ACTIVE })
  @Index()
  status: ThemeStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail?: string;

  @Column({ type: 'simple-array', nullable: true })
  screenshots: string[];

  // Color system
  @Column({ type: 'jsonb', default: '{}' })
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: {
      primary?: string;
      secondary?: string;
      disabled?: string;
    };
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    borders?: string;
    custom?: Record<string, string>;
  };

  // Typography
  @Column({ type: 'jsonb', default: '{}' })
  typography: {
    fontFamily?: {
      primary?: string;
      secondary?: string;
      mono?: string;
    };
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
    };
    fontWeight?: {
      light?: number;
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
    lineHeight?: {
      tight?: string;
      normal?: string;
      relaxed?: string;
    };
    letterSpacing?: Record<string, string>;
  };

  // Spacing system
  @Column({ type: 'jsonb', default: '{}' })
  spacing: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
  };

  // Border radius
  @Column({ type: 'jsonb', default: '{}' })
  borderRadius: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    full?: string;
  };

  // Shadows
  @Column({ type: 'jsonb', default: '{}' })
  shadows: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };

  // Breakpoints
  @Column({ type: 'jsonb', default: '{}' })
  breakpoints: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
  };

  // Button styles
  @Column({ type: 'jsonb', default: '{}' })
  buttons: {
    primary?: {
      backgroundColor?: string;
      color?: string;
      borderRadius?: string;
      padding?: string;
      fontSize?: string;
      fontWeight?: number;
      hoverBackgroundColor?: string;
      hoverColor?: string;
    };
    secondary?: Record<string, any>;
    outline?: Record<string, any>;
    ghost?: Record<string, any>;
    link?: Record<string, any>;
  };

  // Form styles
  @Column({ type: 'jsonb', default: '{}' })
  forms: {
    input?: {
      backgroundColor?: string;
      borderColor?: string;
      borderRadius?: string;
      padding?: string;
      fontSize?: string;
      focusBorderColor?: string;
      errorBorderColor?: string;
    };
    label?: Record<string, any>;
    error?: Record<string, any>;
  };

  // Card styles
  @Column({ type: 'jsonb', default: '{}' })
  cards: {
    backgroundColor?: string;
    borderRadius?: string;
    shadow?: string;
    padding?: string;
    borderColor?: string;
  };

  // Custom CSS
  @Column({ type: 'text', nullable: true })
  customCss?: string;

  // Custom fonts
  @Column({ type: 'jsonb', default: '[]' })
  customFonts: Array<{
    name: string;
    url: string; // Google Fonts URL or custom font URL
    fallback?: string;
  }>;

  // Global styles
  @Column({ type: 'jsonb', default: '{}' })
  globalStyles: {
    bodyBackgroundColor?: string;
    containerMaxWidth?: string;
    containerPadding?: string;
    linkColor?: string;
    linkHoverColor?: string;
    headingColor?: string;
    headingFontFamily?: string;
  };

  // Component-specific styles
  @Column({ type: 'jsonb', default: '{}' })
  components: {
    header?: Record<string, any>;
    footer?: Record<string, any>;
    navigation?: Record<string, any>;
    hero?: Record<string, any>;
    section?: Record<string, any>;
    modal?: Record<string, any>;
    tooltip?: Record<string, any>;
  };

  // Dark mode support
  @Column({ type: 'boolean', default: false })
  supportsDarkMode: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  darkModeColors: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: Record<string, string>;
  };

  // Metadata
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @Index()
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
