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

@Entity('notes')
export class Note extends TenantBaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  noteType?: string; // call, meeting, email, general, follow_up

  // Relations - A note can be attached to a contact OR an opportunity (or both)
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

  // User who created the note
  @Column({ name: 'created_by_id', type: 'uuid' })
  @Index()
  createdById: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // Optional metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: {
    mentions?: string[]; // User IDs mentioned in the note
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
    }>;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;
}
