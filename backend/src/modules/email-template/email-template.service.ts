import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailTemplate,
  TemplateCategory,
  TemplateStatus,
} from './email-template.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

export interface CreateEmailTemplateDto {
  name: string;
  description?: string;
  category?: TemplateCategory;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  designSettings?: Record<string, any>;
  variables?: Array<{
    key: string;
    label: string;
    description?: string;
    defaultValue?: string;
    required?: boolean;
    type?: string;
  }>;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  status?: TemplateStatus;
  subject?: string;
  preheader?: string;
  htmlContent?: string;
  textContent?: string;
  designSettings?: Record<string, any>;
  variables?: Array<{
    key: string;
    label: string;
    description?: string;
    defaultValue?: string;
    required?: boolean;
    type?: string;
  }>;
}

export interface RenderTemplateDto {
  data: Record<string, any>;
}

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create new email template
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = this.templateRepository.create({
      tenantId,
      ...dto,
      category: dto.category || TemplateCategory.CUSTOM,
      status: TemplateStatus.DRAFT,
      createdBy: userId,
      usageCount: 0,
    });

    // Validate content
    const validation = template.validateContent();
    if (!validation.valid) {
      this.logger.warn(
        `Template created with missing required variables: ${validation.missingVariables.join(', ')}`,
      );
    }

    await this.templateRepository.save(template);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'email_template',
      resourceId: template.id,
      description: `Created email template: ${dto.name}`,
      metadata: { category: template.category },
    });

    this.logger.log(`Email template created: ${template.id} (${dto.name})`);

    return template;
  }

  /**
   * Update email template
   */
  async update(
    tenantId: string,
    userId: string,
    templateId: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(tenantId, templateId);

    Object.assign(template, dto);

    // Validate content if updated
    if (dto.htmlContent || dto.variables) {
      const validation = template.validateContent();
      if (!validation.valid) {
        this.logger.warn(
          `Template updated with missing required variables: ${validation.missingVariables.join(', ')}`,
        );
      }
    }

    await this.templateRepository.save(template);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_template',
      resourceId: template.id,
      description: `Updated email template: ${template.name}`,
    });

    this.logger.log(`Email template updated: ${template.id}`);

    return template;
  }

  /**
   * Delete email template
   */
  async delete(tenantId: string, userId: string, templateId: string): Promise<void> {
    const template = await this.findOne(tenantId, templateId);

    await this.templateRepository.remove(template);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource: 'email_template',
      resourceId: template.id,
      description: `Deleted email template: ${template.name}`,
    });

    this.logger.log(`Email template deleted: ${template.id}`);
  }

  /**
   * Clone email template
   */
  async clone(
    tenantId: string,
    userId: string,
    templateId: string,
    newName?: string,
  ): Promise<EmailTemplate> {
    const original = await this.findOne(tenantId, templateId);

    const cloned = this.templateRepository.create({
      tenantId,
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      category: original.category,
      status: TemplateStatus.DRAFT,
      subject: original.subject,
      preheader: original.preheader,
      htmlContent: original.htmlContent,
      textContent: original.textContent,
      designSettings: original.designSettings,
      variables: original.variables,
      createdBy: userId,
      clonedFrom: original.id,
      usageCount: 0,
    });

    await this.templateRepository.save(cloned);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'email_template',
      resourceId: cloned.id,
      description: `Cloned email template from: ${original.name}`,
      metadata: { originalId: original.id },
    });

    this.logger.log(`Email template cloned: ${cloned.id} from ${original.id}`);

    return cloned;
  }

  /**
   * Activate template
   */
  async activate(
    tenantId: string,
    userId: string,
    templateId: string,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(tenantId, templateId);

    // Validate before activation
    const validation = template.validateContent();
    if (!validation.valid) {
      throw new BadRequestException(
        `Template has missing required variables: ${validation.missingVariables.join(', ')}`,
      );
    }

    template.status = TemplateStatus.ACTIVE;
    await this.templateRepository.save(template);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_template',
      resourceId: template.id,
      description: `Activated email template: ${template.name}`,
    });

    this.logger.log(`Email template activated: ${template.id}`);

    return template;
  }

  /**
   * Archive template
   */
  async archive(
    tenantId: string,
    userId: string,
    templateId: string,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(tenantId, templateId);

    template.status = TemplateStatus.ARCHIVED;
    await this.templateRepository.save(template);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_template',
      resourceId: template.id,
      description: `Archived email template: ${template.name}`,
    });

    this.logger.log(`Email template archived: ${template.id}`);

    return template;
  }

  /**
   * Render template with data
   */
  async render(
    tenantId: string,
    templateId: string,
    dto: RenderTemplateDto,
  ): Promise<{ subject: string; html: string; text?: string }> {
    const template = await this.findOne(tenantId, templateId);

    // Check for required variables
    const requiredVars = template.getRequiredVariables();
    const missingVars = requiredVars.filter((v) => !(v in dto.data));

    if (missingVars.length > 0) {
      throw new BadRequestException(
        `Missing required variables: ${missingVars.join(', ')}`,
      );
    }

    const rendered = template.renderContent(dto.data);

    // Increment usage count
    template.incrementUsage();
    await this.templateRepository.save(template);

    return rendered;
  }

  /**
   * Preview template with sample data
   */
  async preview(
    tenantId: string,
    templateId: string,
    sampleData?: Record<string, any>,
  ): Promise<{ subject: string; html: string; text?: string; variables: any[] }> {
    const template = await this.findOne(tenantId, templateId);

    // Generate sample data for all variables if not provided
    const data = sampleData || this.generateSampleData(template);

    const rendered = template.renderContent(data);

    return {
      ...rendered,
      variables: template.variables || [],
    };
  }

  /**
   * Find one template
   */
  async findOne(tenantId: string, templateId: string): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({
      where: { tenantId, id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  /**
   * Find all templates
   */
  async findAll(
    tenantId: string,
    category?: TemplateCategory,
    status?: TemplateStatus,
  ): Promise<EmailTemplate[]> {
    const where: any = { tenantId };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    return await this.templateRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find active templates by category
   */
  async findActiveByCategory(
    tenantId: string,
    category: TemplateCategory,
  ): Promise<EmailTemplate[]> {
    return await this.templateRepository.find({
      where: {
        tenantId,
        category,
        status: TemplateStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get template statistics
   */
  async getStatistics(tenantId: string, templateId: string): Promise<any> {
    const template = await this.findOne(tenantId, templateId);

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      status: template.status,
      usageCount: template.usageCount,
      lastUsedAt: template.lastUsedAt,
      createdAt: template.createdAt,
      variableCount: template.variables?.length || 0,
      requiredVariableCount: template.getRequiredVariables().length,
      isValid: template.validateContent().valid,
    };
  }

  /**
   * Search templates
   */
  async search(tenantId: string, query: string): Promise<EmailTemplate[]> {
    return await this.templateRepository
      .createQueryBuilder('template')
      .where('template.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(template.name ILIKE :query OR template.description ILIKE :query OR template.subject ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('template.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Generate sample data for template variables
   */
  private generateSampleData(template: EmailTemplate): Record<string, any> {
    const sampleData: Record<string, any> = {};

    if (!template.variables) {
      return sampleData;
    }

    for (const variable of template.variables) {
      if (variable.defaultValue) {
        sampleData[variable.key] = variable.defaultValue;
      } else {
        switch (variable.type) {
          case 'text':
            sampleData[variable.key] = `Sample ${variable.label}`;
            break;
          case 'number':
            sampleData[variable.key] = '123';
            break;
          case 'date':
            sampleData[variable.key] = new Date().toLocaleDateString();
            break;
          case 'boolean':
            sampleData[variable.key] = 'true';
            break;
          case 'url':
            sampleData[variable.key] = 'https://example.com';
            break;
          case 'email':
            sampleData[variable.key] = 'user@example.com';
            break;
          default:
            sampleData[variable.key] = `[${variable.label}]`;
        }
      }
    }

    return sampleData;
  }
}
