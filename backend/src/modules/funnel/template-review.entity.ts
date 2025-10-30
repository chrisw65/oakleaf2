import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { FunnelTemplate } from './funnel-template.entity';
import { User } from '../user/user.entity';

@Entity('template_reviews')
export class TemplateReview extends TenantBaseEntity {
  @Column({ name: 'template_id', type: 'uuid' })
  @Index()
  templateId: string;

  @ManyToOne(() => FunnelTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: FunnelTemplate;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  review?: string;

  @Column({ type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @Column({ type: 'integer', default: 0 })
  helpfulCount: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
