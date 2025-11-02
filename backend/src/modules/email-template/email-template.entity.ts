import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum TemplateCategory {
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  NOTIFICATION = 'notification',
  WELCOME = 'welcome',
  ABANDONED_CART = 'abandoned_cart',
  ORDER_CONFIRMATION = 'order_confirmation',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  CUSTOM = 'custom',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

/**
 * Email Template entity for managing reusable email templates
 */
@Entity('email_templates')
@Index(['tenantId', 'category'])
@Index(['tenantId', 'status'])
export class EmailTemplate extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TemplateCategory, default: TemplateCategory.CUSTOM })
  category: TemplateCategory;

  @Column({ type: 'enum', enum: TemplateStatus, default: TemplateStatus.DRAFT })
  status: TemplateStatus;

  // Email Content
  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preheader?: string; // Email preview text

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent?: string; // Plain text version

  // Design Settings
  @Column({ type: 'jsonb', nullable: true })
  designSettings?: {
    backgroundColor?: string;
    textColor?: string;
    linkColor?: string;
    fontFamily?: string;
    fontSize?: string;
    headerImage?: string;
    footerContent?: string;
    layout?: 'single-column' | 'two-column' | 'custom';
  };

  // Template Variables
  @Column({ type: 'jsonb', nullable: true })
  variables?: Array<{
    key: string;
    label: string;
    description?: string;
    defaultValue?: string;
    required?: boolean;
    type?: 'text' | 'number' | 'date' | 'boolean' | 'url' | 'email';
  }>;

  // Metadata
  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  clonedFrom?: string; // ID of the template this was cloned from

  @Column({ type: 'int', default: 0 })
  usageCount: number; // Number of times template has been used

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Check if template is active
   */
  isActive(): boolean {
    return this.status === TemplateStatus.ACTIVE;
  }

  /**
   * Increment usage count
   */
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  /**
   * Get all variable keys
   */
  getVariableKeys(): string[] {
    if (!this.variables) {
      return [];
    }
    return this.variables.map((v) => v.key);
  }

  /**
   * Get required variables
   */
  getRequiredVariables(): string[] {
    if (!this.variables) {
      return [];
    }
    return this.variables.filter((v) => v.required).map((v) => v.key);
  }

  /**
   * Validate template content has all required variables
   */
  validateContent(): { valid: boolean; missingVariables: string[] } {
    const requiredVars = this.getRequiredVariables();
    const missingVariables: string[] = [];

    for (const varKey of requiredVars) {
      const placeholder = `{{${varKey}}}`;
      if (!this.htmlContent.includes(placeholder)) {
        missingVariables.push(varKey);
      }
    }

    return {
      valid: missingVariables.length === 0,
      missingVariables,
    };
  }

  /**
   * Replace variables in content
   */
  renderContent(data: Record<string, any>): { subject: string; html: string; text?: string } {
    let renderedSubject = this.subject;
    let renderedHtml = this.htmlContent;
    let renderedText = this.textContent;

    // Replace variables in subject
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(placeholder, String(value));
      renderedHtml = renderedHtml.replace(placeholder, String(value));
      if (renderedText) {
        renderedText = renderedText.replace(placeholder, String(value));
      }
    }

    // Replace with default values for missing variables
    if (this.variables) {
      for (const variable of this.variables) {
        if (!(variable.key in data) && variable.defaultValue) {
          const placeholder = new RegExp(`{{${variable.key}}}`, 'g');
          renderedSubject = renderedSubject.replace(placeholder, variable.defaultValue);
          renderedHtml = renderedHtml.replace(placeholder, variable.defaultValue);
          if (renderedText) {
            renderedText = renderedText.replace(placeholder, variable.defaultValue);
          }
        }
      }
    }

    return {
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
    };
  }
}
