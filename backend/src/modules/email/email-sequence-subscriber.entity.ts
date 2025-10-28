import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { EmailSequence } from './email-sequence.entity';
import { Contact } from '../crm/contact.entity';

export enum SubscriberStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
}

@Entity('email_sequence_subscribers')
export class EmailSequenceSubscriber extends TenantBaseEntity {
  @Column({ name: 'sequence_id', type: 'uuid' })
  @Index()
  sequenceId: string;

  @ManyToOne(() => EmailSequence, (sequence) => sequence.subscribers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sequence_id' })
  sequence: EmailSequence;

  @Column({ name: 'contact_id', type: 'uuid' })
  @Index()
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ type: 'enum', enum: SubscriberStatus, default: SubscriberStatus.ACTIVE })
  @Index()
  status: SubscriberStatus;

  @Column({ type: 'integer', default: 0 })
  currentStep: number; // Current step position

  @Column({ type: 'timestamp', nullable: true })
  nextStepAt?: Date; // When to send next email

  @Column({ type: 'timestamp' })
  enrolledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastEmailSentAt?: Date;

  @Column({ type: 'integer', default: 0 })
  emailsSent: number;

  @Column({ type: 'integer', default: 0 })
  emailsOpened: number;

  @Column({ type: 'integer', default: 0 })
  emailsClicked: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

// Composite index for efficient queries
@Index(['tenantId', 'sequenceId', 'status'])
@Index(['tenantId', 'contactId'])
@Index(['nextStepAt', 'status'])
export class EmailSequenceSubscriberIndexes {}
