import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Contact } from '../crm/contact.entity';
import { EmailCampaign } from './email-campaign.entity';
import { EmailSequence } from './email-sequence.entity';
import { EmailSequenceStep } from './email-sequence-step.entity';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  SPAM = 'spam',
  UNSUBSCRIBED = 'unsubscribed',
  FAILED = 'failed',
}

export enum EmailType {
  CAMPAIGN = 'campaign',
  SEQUENCE = 'sequence',
  TRANSACTIONAL = 'transactional',
  AUTOMATION = 'automation',
}

@Entity('email_logs')
export class EmailLog extends TenantBaseEntity {
  @Column({ name: 'contact_id', type: 'uuid' })
  @Index()
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ type: 'enum', enum: EmailType })
  @Index()
  emailType: EmailType;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  @Index()
  campaignId?: string;

  @ManyToOne(() => EmailCampaign, (campaign) => campaign.logs, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign?: EmailCampaign;

  @Column({ name: 'sequence_id', type: 'uuid', nullable: true })
  @Index()
  sequenceId?: string;

  @ManyToOne(() => EmailSequence, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sequence_id' })
  sequence?: EmailSequence;

  @Column({ name: 'sequence_step_id', type: 'uuid', nullable: true })
  @Index()
  sequenceStepId?: string;

  @ManyToOne(() => EmailSequenceStep, (step) => step.logs, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sequence_step_id' })
  sequenceStep?: EmailSequenceStep;

  @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.PENDING })
  @Index()
  status: EmailStatus;

  @Column({ type: 'varchar', length: 255 })
  recipientEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientName?: string;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromName?: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent?: string;

  // Tracking
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  trackingId: string; // Unique ID for tracking opens/clicks

  @Column({ type: 'varchar', length: 255, nullable: true })
  messageId?: string; // Email provider's message ID

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstOpenedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOpenedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  openCount: number;

  @Column({ type: 'timestamp', nullable: true })
  firstClickedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastClickedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  clickCount: number;

  @Column({ type: 'jsonb', default: '[]' })
  clickedUrls: Array<{
    url: string;
    clickedAt: Date;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  bouncedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bounceType?: string; // 'hard', 'soft', 'complaint'

  @Column({ type: 'text', nullable: true })
  bounceReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  unsubscribedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  spamComplaintAt?: Date;

  // A/B testing
  @Column({ type: 'varchar', length: 10, nullable: true })
  variant?: string; // 'A' or 'B'

  // User agent and IP for tracking
  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device?: string; // 'desktop', 'mobile', 'tablet'

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailClient?: string; // 'Gmail', 'Outlook', etc.

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
