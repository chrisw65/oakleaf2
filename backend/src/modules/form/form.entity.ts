import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  FILE = 'file',
  HIDDEN = 'hidden',
}

@Entity('forms')
export class Form extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  fields: Array<{
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    validation?: any;
    options?: string[]; // For select, radio, checkbox
    defaultValue?: any;
    order: number;
  }>;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    sendNotification?: boolean;
    notificationEmail?: string;
    [key: string]: any;
  };

  @Column({ type: 'integer', default: 0 })
  submissions: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

@Entity('form_submissions')
export class FormSubmission extends TenantBaseEntity {
  @Column({ name: 'form_id', type: 'uuid' })
  @Index()
  formId: string;

  @Column({ name: 'page_id', type: 'uuid', nullable: true })
  @Index()
  pageId: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string;
}
