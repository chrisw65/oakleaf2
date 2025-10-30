import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum BlockCategory {
  HERO = 'hero',
  HEADER = 'header',
  FOOTER = 'footer',
  FEATURE = 'feature',
  TESTIMONIAL = 'testimonial',
  PRICING = 'pricing',
  CTA = 'cta',
  CONTENT = 'content',
  FORM = 'form',
  GALLERY = 'gallery',
  TEAM = 'team',
  FAQ = 'faq',
  STATS = 'stats',
  BLOG = 'blog',
  CONTACT = 'contact',
  CUSTOM = 'custom',
}

@Entity('page_blocks')
export class PageBlock extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: BlockCategory })
  @Index()
  category: BlockCategory;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  // Block structure (array of elements)
  @Column({ type: 'jsonb' })
  structure: {
    elements: Array<{
      elementType: string;
      elementId?: string;
      order: number;
      content: any;
      styles: any;
      interactions?: any;
      visibility?: any;
    }>;
    containerStyles?: any;
  };

  @Column({ type: 'boolean', default: true })
  isPublic: boolean; // Available to all tenants

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
