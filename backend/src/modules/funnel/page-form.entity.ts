import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Page } from './page.entity';
import { Contact } from '../crm/contact.entity';

export enum FormType {
  CONTACT = 'contact',
  LEAD_CAPTURE = 'lead_capture',
  SURVEY = 'survey',
  QUIZ = 'quiz',
  REGISTRATION = 'registration',
  ORDER = 'order',
  SURVEY_MULTI_STEP = 'survey_multi_step',
  CUSTOM = 'custom',
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  DATE = 'date',
  TIME = 'time',
  FILE = 'file',
  RATING = 'rating',
  SLIDER = 'slider',
  ADDRESS = 'address',
  SIGNATURE = 'signature',
  HIDDEN = 'hidden',
}

export enum FormSubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('page_forms')
export class PageForm extends TenantBaseEntity {
  @Column({ name: 'page_id', type: 'uuid', nullable: true })
  @Index()
  pageId?: string;

  @ManyToOne(() => Page, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'page_id' })
  page?: Page;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: FormType, default: FormType.CONTACT })
  @Index()
  formType: FormType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Form structure
  @Column({ type: 'jsonb' })
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required: boolean;
    defaultValue?: any;

    // Validation
    validation?: {
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: string;
      customError?: string;
    };

    // For select/radio/checkbox
    options?: Array<{
      label: string;
      value: string;
    }>;

    // Conditional logic
    conditionalLogic?: {
      show: boolean; // show or hide
      rules: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    };

    // Styling
    width?: string; // e.g., '50%', 'full'
    cssClass?: string;
    styles?: Record<string, any>;

    // Metadata
    helpText?: string;
    order: number;
  }>;

  // Multi-step configuration
  @Column({ type: 'boolean', default: false })
  isMultiStep: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    fieldIds: string[]; // References field ids
    order: number;
  }>;

  // Submit configuration
  @Column({ type: 'jsonb', default: '{}' })
  submitConfig: {
    buttonText?: string;
    buttonStyles?: Record<string, any>;
    redirectUrl?: string;
    redirectDelay?: number; // seconds
    successMessage?: string;
    errorMessage?: string;
    showConfirmation?: boolean;
  };

  // Actions on submission
  @Column({ type: 'jsonb', default: '[]' })
  actions: Array<{
    type: string; // 'create_contact', 'send_email', 'webhook', 'tag', 'add_to_list', etc.
    config: any;
    order: number;
  }>;

  // Integration settings
  @Column({ type: 'jsonb', default: '{}' })
  integrations: {
    email?: {
      sendToUser?: boolean;
      sendToAdmin?: boolean;
      adminEmail?: string;
      emailTemplate?: string;
    };
    webhook?: {
      url?: string;
      method?: string;
      headers?: Record<string, string>;
    };
    crm?: {
      createContact?: boolean;
      updateContact?: boolean;
      fieldMapping?: Record<string, string>;
    };
  };

  // Spam protection
  @Column({ type: 'boolean', default: true })
  enableCaptcha: boolean;

  @Column({ type: 'boolean', default: true })
  enableHoneypot: boolean;

  @Column({ type: 'integer', default: 5 })
  rateLimit: number; // submissions per hour per IP

  // Analytics
  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ type: 'integer', default: 0 })
  submissions: number;

  @Column({ type: 'integer', default: 0 })
  completions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number; // %

  @Column({ type: 'integer', default: 0 })
  averageCompletionTime: number; // seconds

  @Column({ type: 'jsonb', default: '{}' })
  fieldAnalytics: Record<string, {
    dropoffCount: number;
    errorCount: number;
    averageTime: number;
  }>;

  @OneToMany(() => FormSubmission, (submission) => submission.form)
  formSubmissions: FormSubmission[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}

@Entity('form_submissions')
export class FormSubmission extends TenantBaseEntity {
  @Column({ name: 'form_id', type: 'uuid' })
  @Index()
  formId: string;

  @ManyToOne(() => PageForm, (form) => form.formSubmissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_id' })
  form: PageForm;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId?: string;

  @ManyToOne(() => Contact, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @Column({ type: 'jsonb' })
  data: Record<string, any>; // Form field values

  @Column({ type: 'enum', enum: FormSubmissionStatus, default: FormSubmissionStatus.PENDING })
  @Index()
  status: FormSubmissionStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referrer?: string;

  @Column({ type: 'jsonb', default: '{}' })
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  @Column({ type: 'integer', nullable: true })
  completionTime: number; // seconds

  @Column({ type: 'boolean', default: false })
  isSpam: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  processingErrors: Array<{
    action: string;
    error: string;
    timestamp: Date;
  }>;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;
}
