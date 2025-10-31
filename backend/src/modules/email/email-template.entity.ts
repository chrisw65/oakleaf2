import {
  Entity,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { EmailCampaign } from './email-campaign.entity';
import { EmailSequenceStep } from './email-sequence-step.entity';

export enum TemplateType {
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  AUTOMATION = 'automation',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('email_templates')
export class EmailTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TemplateType, default: TemplateType.MARKETING })
  type: TemplateType;

  @Column({ type: 'enum', enum: TemplateStatus, default: TemplateStatus.DRAFT })
  @Index()
  status: TemplateStatus;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  preheader?: string; // Preview text shown in email clients

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromEmail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replyTo?: string;

  @Column({ type: 'text' })
  htmlContent: string; // HTML version of email

  @Column({ type: 'text', nullable: true })
  textContent?: string; // Plain text version

  @Column({ type: 'text', nullable: true })
  mjmlContent?: string; // MJML source (if using MJML)

  @Column({ type: 'jsonb', default: '[]' })
  variables: Array<{
    name: string;
    placeholder: string;
    description?: string;
    defaultValue?: string;
  }>; // Available variables like {{firstName}}, {{orderNumber}}

  @Column({ type: 'jsonb', default: '{}' })
  designSettings: {
    backgroundColor?: string;
    contentWidth?: number;
    fontFamily?: string;
    primaryColor?: string;
    buttonColor?: string;
  };

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'integer', default: 0 })
  usageCount: number; // How many times this template has been used

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Relations
  @OneToMany(() => EmailCampaign, (campaign) => campaign.template)
  campaigns: EmailCampaign[];

  @OneToMany(() => EmailSequenceStep, (step) => step.template)
  sequenceSteps: EmailSequenceStep[];
}
