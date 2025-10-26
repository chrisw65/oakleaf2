import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum ContactSource {
  MANUAL = 'manual',
  FORM = 'form',
  IMPORT = 'import',
  API = 'api',
  LANDING_PAGE = 'landing_page',
  AFFILIATE = 'affiliate',
  WEBINAR = 'webinar',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
  BLOCKED = 'blocked',
}

@Entity('contacts')
export class Contact extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobTitle?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: ContactSource,
    default: ContactSource.MANUAL,
  })
  @Index()
  source: ContactSource;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  @Index()
  status: ContactStatus;

  @Column({ type: 'integer', default: 0 })
  score: number; // Lead score

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lifetime_value: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'jsonb', default: {} })
  socialProfiles: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    [key: string]: any;
  };

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  @Index()
  ownerId?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastContactedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'boolean', default: false })
  @Index()
  isSubscribed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  subscribedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  unsubscribedAt?: Date;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @ManyToMany(() => Tag, (tag) => tag.contacts)
  @JoinTable({
    name: 'contact_tags',
    joinColumn: { name: 'contact_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => ContactCustomFieldValue, (value) => value.contact)
  customFieldValues: ContactCustomFieldValue[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.contact)
  opportunities: Opportunity[];

  @OneToMany(() => ContactActivity, (activity) => activity.contact)
  activities: ContactActivity[];
}

@Entity('tags')
export class Tag extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
  color: string; // Hex color code

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  contactCount: number;

  // Relations
  @ManyToMany(() => Contact, (contact) => contact.tags)
  contacts: Contact[];
}

@Entity('custom_fields')
export class CustomField extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  fieldKey: string; // Unique key for the field (e.g., 'company_size')

  @Column({ type: 'varchar', length: 50 })
  fieldType: string; // text, number, date, boolean, select, multi_select

  @Column({ type: 'jsonb', default: {} })
  options: {
    choices?: string[]; // For select/multi_select
    min?: number;
    max?: number;
    placeholder?: string;
    defaultValue?: any;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => ContactCustomFieldValue, (value) => value.customField)
  values: ContactCustomFieldValue[];
}

@Entity('contact_custom_field_values')
export class ContactCustomFieldValue extends TenantBaseEntity {
  @Column({ name: 'contact_id', type: 'uuid' })
  @Index()
  contactId: string;

  @Column({ name: 'custom_field_id', type: 'uuid' })
  @Index()
  customFieldId: string;

  @Column({ type: 'jsonb' })
  value: any; // Store any type of value

  // Relations
  @ManyToOne(() => Contact, (contact) => contact.customFieldValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => CustomField, (field) => field.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'custom_field_id' })
  customField: CustomField;
}

@Entity('contact_activities')
export class ContactActivity extends TenantBaseEntity {
  @Column({ name: 'contact_id', type: 'uuid' })
  @Index()
  contactId: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  activityType: string; // email_sent, email_opened, form_submitted, page_viewed, note_added, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    emailId?: string;
    funnelId?: string;
    pageId?: string;
    formId?: string;
    [key: string]: any;
  };

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string; // User who performed the action (if manual)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  occurredAt: Date;

  // Relations
  @ManyToOne(() => Contact, (contact) => contact.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}

// Forward declaration to avoid circular dependency
import { Opportunity } from './opportunity.entity';
