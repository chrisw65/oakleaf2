import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { EmailSequence } from './email-sequence.entity';
import { EmailTemplate } from './email-template.entity';
import { EmailLog } from './email-log.entity';

export enum StepDelayType {
  IMMEDIATE = 'immediate',
  DAYS = 'days',
  HOURS = 'hours',
  WEEKS = 'weeks',
}

@Entity('email_sequence_steps')
export class EmailSequenceStep extends TenantBaseEntity {
  @Column({ name: 'sequence_id', type: 'uuid' })
  @Index()
  sequenceId: string;

  @ManyToOne(() => EmailSequence, (sequence) => sequence.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sequence_id' })
  sequence: EmailSequence;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  position: number; // Order in sequence (0, 1, 2, ...)

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  @Index()
  templateId?: string;

  @ManyToOne(() => EmailTemplate, (template) => template.sequenceSteps, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'template_id' })
  template?: EmailTemplate;

  // Email content
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

  // Delay settings
  @Column({ type: 'enum', enum: StepDelayType, default: StepDelayType.DAYS })
  delayType: StepDelayType;

  @Column({ type: 'integer', default: 0 })
  delayValue: number; // 0 for immediate, or number of hours/days/weeks

  // Conditions
  @Column({ type: 'boolean', default: false })
  hasConditions: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  conditions: {
    mustOpen?: boolean; // Must have opened previous email
    mustClick?: boolean; // Must have clicked link in previous email
    mustNotOpen?: boolean; // Must not have opened previous email
    hasTag?: string[]; // Must have these tags
    notHasTag?: string[]; // Must not have these tags
  };

  // Statistics
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

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  openRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clickRate: number;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => EmailLog, (log) => log.sequenceStep)
  logs: EmailLog[];
}
