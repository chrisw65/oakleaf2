// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunnelTemplate } from '../funnel-template.entity';
import { TemplateCategory } from '../template-category.entity';
import { TemplateReview } from '../template-review.entity';
import { Funnel, FunnelStatus } from '../funnel.entity';
import { Page } from '../page.entity';
import {
  CreateTemplateCategoryDto,
  UpdateTemplateCategoryDto,
  CreateTemplateReviewDto,
  UpdateTemplateReviewDto,
  SaveFunnelAsTemplateDto,
  CloneTemplateDto,
} from '../dto/template-library.dto';

@Injectable()
export class TemplateLibraryService {
  constructor(
    @InjectRepository(FunnelTemplate)
    private readonly templateRepository: Repository<FunnelTemplate>,
    @InjectRepository(TemplateCategory)
    private readonly categoryRepository: Repository<TemplateCategory>,
    @InjectRepository(TemplateReview)
    private readonly reviewRepository: Repository<TemplateReview>,
    @InjectRepository(Funnel)
    private readonly funnelRepository: Repository<Funnel>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  // ==================== Template Categories ====================

  async createCategory(
    tenantId: string,
    dto: CreateTemplateCategoryDto,
  ): Promise<TemplateCategory> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.categoryRepository.findOne({
      where: { slug, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Category with this slug already exists');
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug,
      tenantId,
    });

    return await this.categoryRepository.save(category);
  }

  async updateCategory(
    tenantId: string,
    categoryId: string,
    dto: UpdateTemplateCategoryDto,
  ): Promise<TemplateCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug, tenantId },
      });

      if (existing) {
        throw new BadRequestException('Category with this slug already exists');
      }
    }

    Object.assign(category, dto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(tenantId: string, categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, tenantId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.remove(category);
  }

  async getCategories(tenantId: string): Promise<TemplateCategory[]> {
    return await this.categoryRepository.find({
      where: { tenantId },
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  // ==================== Templates ====================

  async saveFunnelAsTemplate(
    tenantId: string,
    userId: string,
    dto: SaveFunnelAsTemplateDto,
  ): Promise<FunnelTemplate> {
    const funnel = await this.funnelRepository.findOne({
      where: { id: dto.funnelId, tenantId },
      relations: ['pages'],
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    // Get all pages with their content
    const pages = await this.pageRepository.find({
      where: { funnelId: funnel.id, tenantId },
      order: { order: 'ASC' },
    });

    // Generate slug
    const slug = this.generateSlug(dto.name);

    // Check for unique slug
    const existing = await this.templateRepository.findOne({
      where: { slug, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Template with this slug already exists');
    }

    // Create template from funnel structure
    const template = this.templateRepository.create({
      name: dto.name,
      slug,
      description: dto.description || funnel.description,
      categoryId: dto.categoryId,
      thumbnail: dto.thumbnail,
      isPublic: dto.isPublic || false,
      createdBy: userId,
      tenantId,
      structure: {
        funnelType: funnel.funnelType,
        settings: funnel.settings,
        pages: pages.map((page) => ({
          name: page.name,
          slug: page.slug,
          pageType: page.pageType,
          content: page.content,
          styles: page.styles,
          seoSettings: page.seoSettings,
          order: page.order,
        })),
      },
    });

    const saved = await this.templateRepository.save(template);

    // Update category template count
    if (dto.categoryId) {
      await this.updateCategoryCount(tenantId, dto.categoryId);
    }

    return saved;
  }

  async cloneTemplate(
    tenantId: string,
    dto: CloneTemplateDto,
  ): Promise<Funnel> {
    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if template is public or belongs to this tenant
    if (!template.isPublic && template.tenantId !== tenantId) {
      throw new BadRequestException('Template not accessible');
    }

    // Create funnel from template
    // @ts-ignore - TypeORM type issue
    const funnel = this.funnelRepository.create({
      name: dto.name || template.name,
      description: template.description,
      funnelType: template.structure.funnelType,
      status: FunnelStatus.DRAFT,
      settings: template.structure.settings || {},
      templateId: template.id,
      tenantId,
    });

    const savedFunnel = await this.funnelRepository.save(funnel);

    // Create pages from template
      // @ts-ignore - TypeORM type issue
    const pagePromises = template.structure.pages.map((pageData: any, index: number) => {
      const page = this.pageRepository.create({
        funnelId: savedFunnel.id,
        name: pageData.name,
        slug: `${pageData.slug}-${Date.now()}`,
        pageType: pageData.pageType,
        content: pageData.content || {},
        styles: pageData.styles || {},
        seoSettings: pageData.seoSettings || {},
        order: pageData.order || index,
        tenantId,
      });

      return this.pageRepository.save(page);
    });

    await Promise.all(pagePromises);

    // Increment template usage count
    template.usageCount += 1;
    await this.templateRepository.save(template);

    return savedFunnel;
  }

  async getTemplates(
    tenantId: string,
    categoryId?: string,
  ): Promise<FunnelTemplate[]> {
    const where: any = [
      { tenantId, status: 'active' },
      { isPublic: true, status: 'active' },
    ];

    if (categoryId) {
      where[0].categoryId = categoryId;
      where[1].categoryId = categoryId;
    }

    return await this.templateRepository.find({
      where,
      relations: ['category'],
      order: { isFeatured: 'DESC', usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async getTemplate(templateId: string): Promise<FunnelTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
      relations: ['category', 'reviews'],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  // ==================== Template Reviews ====================

  async createReview(
    tenantId: string,
    userId: string,
    dto: CreateTemplateReviewDto,
  ): Promise<TemplateReview> {
    const template = await this.templateRepository.findOne({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if user already reviewed
    const existing = await this.reviewRepository.findOne({
      where: {
        templateId: dto.templateId,
        userId,
        tenantId,
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this template');
    }

    const review = this.reviewRepository.create({
      ...dto,
      userId,
      tenantId,
    });

    const saved = await this.reviewRepository.save(review);

    // Update template rating
    await this.updateTemplateRating(dto.templateId);

    return saved;
  }

  async updateReview(
    tenantId: string,
    userId: string,
    reviewId: string,
    dto: UpdateTemplateReviewDto,
  ): Promise<TemplateReview> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId, tenantId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, dto);
    const saved = await this.reviewRepository.save(review);

    // Update template rating
    await this.updateTemplateRating(review.templateId);

    return saved;
  }

  async deleteReview(
    tenantId: string,
    userId: string,
    reviewId: string,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId, tenantId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const templateId = review.templateId;
    await this.reviewRepository.remove(review);

    // Update template rating
    await this.updateTemplateRating(templateId);
  }

  // ==================== Helper Methods ====================

  private async updateCategoryCount(
    tenantId: string,
    categoryId: string,
  ): Promise<void> {
    const count = await this.templateRepository.count({
      where: { categoryId, tenantId },
    });

    await this.categoryRepository.update(
      { id: categoryId },
      { templateCount: count },
    );
  }

  private async updateTemplateRating(templateId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { templateId },
    });

    if (reviews.length === 0) {
      await this.templateRepository.update(
        { id: templateId },
        { averageRating: 0, reviewCount: 0 },
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.templateRepository.update(
      { id: templateId },
      {
        averageRating: parseFloat(averageRating.toFixed(2)),
        reviewCount: reviews.length,
      },
    );
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
