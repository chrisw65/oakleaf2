import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';
import { EmailSequenceStep } from './email-sequence-step.entity';
import { EmailSequenceSubscriber } from './email-sequence-subscriber.entity';

export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum SequenceTrigger {
  MANUAL = 'manual', // Manually enroll contacts
  CONTACT_CREATED = 'contact_created',
  TAG_ADDED = 'tag_added',
  FORM_SUBMITTED = 'form_submitted',
  PRODUCT_PURCHASED = 'product_purchased',
  CART_ABANDONED = 'cart_abandoned',
}

@Entity('email_sequences')
export class EmailSequence extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: SequenceStatus, default: SequenceStatus.DRAFT })
  @Index()
  status: SequenceStatus;

  @Column({ type: 'enum', enum: SequenceTrigger, default: SequenceTrigger.MANUAL })
  trigger: SequenceTrigger;

  @Column({ type: 'jsonb', default: '{}' })
  triggerConditions: {
    tagIds?: string[];
    formIds?: string[];
    productIds?: string[];
  };

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Enrollment settings
  @Column({ type: 'boolean', default: false })
  allowReenrollment: boolean; // Can contacts be enrolled multiple times?

  @Column({ type: 'integer', nullable: true })
  reenrollmentDelay?: number; // Days to wait before re-enrollment

  @Column({ type: 'boolean', default: true })
  stopOnReply: boolean; // Stop sequence if contact replies

  @Column({ type: 'boolean', default: false })
  stopOnClick: boolean; // Stop sequence if contact clicks a link

  @Column({ type: 'boolean', default: false })
  stopOnUnsubscribe: boolean; // Stop sequence if contact unsubscribes

  // Time settings
  @Column({ type: 'varchar', length: 50, default: 'contact_timezone' })
  timezoneMode: string; // 'contact_timezone', 'tenant_timezone', or specific timezone

  @Column({ type: 'time', nullable: true })
  sendTime?: string; // Preferred time to send (HH:MM)

  @Column({ type: 'jsonb', default: '[1,2,3,4,5]' })
  sendDays: number[]; // Days of week to send (0=Sunday, 6=Saturday)

  // Statistics
  @Column({ type: 'integer', default: 0 })
  activeSubscribers: number;

  @Column({ type: 'integer', default: 0 })
  completedSubscribers: number;

  @Column({ type: 'integer', default: 0 })
  totalEnrolled: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageOpenRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageClickRate: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => EmailSequenceStep, (step) => step.sequence, {
    cascade: true,
  })
  steps: EmailSequenceStep[];

  @OneToMany(() => EmailSequenceSubscriber, (subscriber) => subscriber.sequence)
  subscribers: EmailSequenceSubscriber[];
}
