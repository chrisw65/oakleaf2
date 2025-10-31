import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EmailTemplate, TemplateStatus } from '../email-template.entity';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  EmailTemplateQueryDto,
} from '../dto/email-template.dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  /**
   * Create a new email template
   */
  async create(
    createDto: CreateEmailTemplateDto,
    tenantId: string,
    userId?: string,
  ): Promise<EmailTemplate> {
    // Check if slug already exists
    const existing = await this.emailTemplateRepository.findOne({
      where: { slug: createDto.slug, tenantId },
    });

    if (existing) {
      throw new ConflictException(`Template with slug "${createDto.slug}" already exists`);
    }

    const template = this.emailTemplateRepository.create({
      ...createDto,
      tenantId,
    });

    const saved = await this.emailTemplateRepository.save(template);
    this.logger.log(`Created email template: ${saved.name}`);

    return saved;
  }

  /**
   * Find all templates with filters
   */
  async findAll(
    queryDto: EmailTemplateQueryDto,
    tenantId: string,
  ): Promise<{ data: EmailTemplate[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.emailTemplateRepository
      .createQueryBuilder('template')
      .where('template.tenantId = :tenantId', { tenantId })
      .andWhere('template.deletedAt IS NULL');

    if (queryDto.type) {
      queryBuilder.andWhere('template.type = :type', { type: queryDto.type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('template.status = :status', { status: queryDto.status });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.subject ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('template.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find template by ID
   */
  async findOne(id: string, tenantId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  /**
   * Find template by slug
   */
  async findBySlug(slug: string, tenantId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { slug, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  /**
   * Update template
   */
  async update(
    id: string,
    updateDto: UpdateEmailTemplateDto,
    tenantId: string,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(id, tenantId);

    // Check slug uniqueness if being updated
    if (updateDto.slug && updateDto.slug !== template.slug) {
      const existing = await this.emailTemplateRepository.findOne({
        where: { slug: updateDto.slug, tenantId },
      });

      if (existing) {
        throw new ConflictException(`Template with slug "${updateDto.slug}" already exists`);
      }
    }

    Object.assign(template, updateDto);
    const updated = await this.emailTemplateRepository.save(template);

    this.logger.log(`Updated email template: ${updated.name}`);
    return updated;
  }

  /**
   * Delete template (soft delete)
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const template = await this.findOne(id, tenantId);
    await this.emailTemplateRepository.softDelete(id);
    this.logger.log(`Deleted email template: ${template.name}`);
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string, tenantId: string): Promise<void> {
    await this.emailTemplateRepository.update(
      { id, tenantId },
      {
        usageCount: () => 'usage_count + 1',
        lastUsedAt: new Date(),
      },
    );
  }

  /**
   * Replace variables in content
   */
  replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value?.toString() || '');
    }

    return result;
  }

  /**
   * Get template statistics
   */
  async getStatistics(tenantId: string): Promise<{
    total: number;
    byType: any[];
    byStatus: any[];
    mostUsed: EmailTemplate[];
  }> {
    const total = await this.emailTemplateRepository.count({
      where: { tenantId },
    });

    const byType = await this.emailTemplateRepository
      .createQueryBuilder('template')
      .select('template.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('template.tenantId = :tenantId', { tenantId })
      .groupBy('template.type')
      .getRawMany();

    const byStatus = await this.emailTemplateRepository
      .createQueryBuilder('template')
      .select('template.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('template.tenantId = :tenantId', { tenantId })
      .groupBy('template.status')
      .getRawMany();

    const mostUsed = await this.emailTemplateRepository.find({
      where: { tenantId },
      order: { usageCount: 'DESC' },
      take: 10,
    });

    return {
      total,
      byType,
      byStatus,
      mostUsed,
    };
  }
}
