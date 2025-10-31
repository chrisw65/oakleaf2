import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { FunnelTemplate } from './funnel-template.entity';

@Entity('template_categories')
export class TemplateCategory extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string;

  @Column({ type: 'integer', default: 0 })
  order: number; // Display order

  @Column({ type: 'integer', default: 0 })
  templateCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => FunnelTemplate, (template) => template.category)
  templates: FunnelTemplate[];
}
