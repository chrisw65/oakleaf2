import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Contact } from './contact.entity';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { User } from '../user/user.entity';

export enum OpportunityStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
  ABANDONED = 'abandoned',
}

export enum OpportunityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('opportunities')
export class Opportunity extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'contact_id', type: 'uuid' })
  @Index()
  contactId: string;

  @Column({ name: 'pipeline_id', type: 'uuid' })
  @Index()
  pipelineId: string;

  @Column({ name: 'stage_id', type: 'uuid' })
  @Index()
  stageId: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  @Index()
  ownerId?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'integer', default: 0 })
  probability: number; // Win probability percentage (0-100)

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  expectedValue: number; // value * (probability / 100)

  @Column({
    type: 'enum',
    enum: OpportunityStatus,
    default: OpportunityStatus.OPEN,
  })
  @Index()
  status: OpportunityStatus;

  @Column({
    type: 'enum',
    enum: OpportunityPriority,
    default: OpportunityPriority.MEDIUM,
  })
  priority: OpportunityPriority;

  @Column({ type: 'timestamp', nullable: true })
  expectedCloseDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCloseDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lostReason?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    source?: string;
    productInterest?: string[];
    notes?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'integer', default: 0 })
  daysInStage: number;

  @Column({ type: 'integer', default: 0 })
  stagePosition: number; // Position within the stage for sorting

  // Relations
  @ManyToOne(() => Contact, (contact) => contact.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @ManyToOne(() => PipelineStage, (stage) => stage.opportunities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: PipelineStage;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;
}
