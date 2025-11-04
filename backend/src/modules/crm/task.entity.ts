import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Contact } from './contact.entity';
import { Opportunity } from './opportunity.entity';
import { User } from '../user/user.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  FOLLOW_UP = 'follow_up',
  TODO = 'todo',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  OTHER = 'other',
}

@Entity('tasks')
export class Task extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.TODO,
  })
  @Index()
  taskType: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @Index()
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @Index()
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'integer', nullable: true })
  estimatedDuration?: number; // in minutes

  @Column({ type: 'integer', nullable: true })
  actualDuration?: number; // in minutes

  // Relations - A task can be attached to a contact OR an opportunity (or both)
  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId?: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ name: 'opportunity_id', type: 'uuid', nullable: true })
  @Index()
  opportunityId?: string;

  @ManyToOne(() => Opportunity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity?: Opportunity;

  // User who created the task
  @Column({ name: 'created_by_id', type: 'uuid' })
  @Index()
  createdById: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // User assigned to the task
  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  @Index()
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo?: User;

  // Reminders
  @Column({ type: 'boolean', default: false })
  hasReminder: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderDate?: Date;

  @Column({ type: 'boolean', default: false })
  reminderSent: boolean;

  // Optional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: {
    location?: string; // For meetings
    phoneNumber?: string; // For calls
    emailSubject?: string; // For emails
    meetingUrl?: string; // For online meetings
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
    }>;
    [key: string]: any;
  };

  // Result/Outcome
  @Column({ type: 'text', nullable: true })
  outcome?: string;
}
