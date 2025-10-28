import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { EmailTemplate } from './email-template.entity';
import { User } from '../user/user.entity';
import { EmailLog } from './email-log.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum CampaignType {
  BROADCAST = 'broadcast', // One-time send
  AB_TEST = 'ab_test', // A/B test
  RSS = 'rss', // RSS to email
}

@Entity('email_campaigns')
export class EmailCampaign extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: CampaignType, default: CampaignType.BROADCAST })
  type: CampaignType;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  @Index()
  status: CampaignStatus;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  @Index()
  templateId?: string;

  @ManyToOne(() => EmailTemplate, (template) => template.campaigns, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'template_id' })
  template?: EmailTemplate;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Email content (can override template)
  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  preheader?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replyTo?: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent?: string;

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  // Targeting - can be segment IDs, tag IDs, or all contacts
  @Column({ type: 'jsonb', default: '[]' })
  segments: string[]; // Segment IDs

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[]; // Tag IDs

  @Column({ type: 'boolean', default: false })
  sendToAll: boolean; // Send to all contacts

  @Column({ type: 'jsonb', default: '[]' })
  excludeSegments: string[]; // Exclude these segments

  @Column({ type: 'jsonb', default: '[]' })
  excludeTags: string[]; // Exclude these tags

  // A/B Testing (for type = 'ab_test')
  @Column({ type: 'varchar', length: 500, nullable: true })
  subjectVariantB?: string; // Alternative subject line

  @Column({ type: 'text', nullable: true })
  htmlContentVariantB?: string; // Alternative content

  @Column({ type: 'integer', nullable: true })
  abTestPercentage?: number; // % to send variant B (e.g., 50 for 50/50 split)

  @Column({ type: 'varchar', length: 50, nullable: true })
  abWinningVariant?: string; // 'A' or 'B'

  // Statistics
  @Column({ type: 'integer', default: 0 })
  recipientCount: number;

  @Column({ type: 'integer', default: 0 })
  sentCount: number;

  @Column({ type: 'integer', default: 0 })
  deliveredCount: number;

  @Column({ type: 'integer', default: 0 })
  openedCount: number;

  @Column({ type: 'integer', default: 0 })
  clickedCount: number;

  @Column({ type: 'integer', default: 0 })
  bouncedCount: number;

  @Column({ type: 'integer', default: 0 })
  unsubscribedCount: number;

  @Column({ type: 'integer', default: 0 })
  spamComplaintCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  openRate: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clickRate: number; // Percentage

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => EmailLog, (log) => log.campaign)
  logs: EmailLog[];
}
