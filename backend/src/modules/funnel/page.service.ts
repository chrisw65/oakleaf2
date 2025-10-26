import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './page.entity';
import { CreatePageDto, UpdatePageDto, CreatePageVariantDto, ReorderPagesDto } from './dto/page.dto';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto, tenantId: string): Promise<Page> {
    // Check if slug already exists in this funnel
    const existing = await this.pageRepository.findOne({
      where: {
        slug: createPageDto.slug,
        funnelId: createPageDto.funnelId,
        tenantId,
      },
    });

    if (existing) {
      throw new ConflictException('Page slug already exists in this funnel');
    }

    // Get the last position if not provided
    if (createPageDto.position === undefined) {
      const lastPage = await this.pageRepository.findOne({
        where: { funnelId: createPageDto.funnelId, tenantId },
        order: { position: 'DESC' },
      });
      createPageDto.position = lastPage ? lastPage.position + 1 : 0;
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      tenantId,
    });

    return this.pageRepository.save(page);
  }

  async findAll(funnelId: string, tenantId: string): Promise<Page[]> {
    return this.pageRepository.find({
      where: { funnelId, tenantId },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id, tenantId },
      relations: ['funnel'],
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async findBySlug(funnelId: string, slug: string, tenantId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { funnelId, slug, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async update(id: string, updatePageDto: UpdatePageDto, tenantId: string): Promise<Page> {
    const page = await this.findOne(id, tenantId);

    // Check slug uniqueness if being updated
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existing = await this.pageRepository.findOne({
        where: {
          slug: updatePageDto.slug,
          funnelId: page.funnelId,
          tenantId,
        },
      });
      if (existing) {
        throw new ConflictException('Page slug already exists in this funnel');
      }
    }

    Object.assign(page, updatePageDto);

    if (updatePageDto.isPublished && !page.publishedAt) {
      page.publishedAt = new Date();
    }

    return this.pageRepository.save(page);
  }

  async reorder(funnelId: string, reorderDto: ReorderPagesDto, tenantId: string): Promise<Page[]> {
    const pages = await this.findAll(funnelId, tenantId);

    for (const page of pages) {
      if (reorderDto.pageOrder[page.id] !== undefined) {
        page.position = reorderDto.pageOrder[page.id];
        await this.pageRepository.save(page);
      }
    }

    return this.findAll(funnelId, tenantId);
  }

  async createVariant(createVariantDto: CreatePageVariantDto, tenantId: string): Promise<Page> {
    const parentPage = await this.findOne(createVariantDto.pageId, tenantId);

    const variant = this.pageRepository.create({
      ...parentPage,
      id: undefined,
      name: `${parentPage.name} - ${createVariantDto.variantName}`,
      isVariant: true,
      parentPageId: parentPage.id,
      variantName: createVariantDto.variantName,
      trafficSplit: createVariantDto.trafficSplit || 50,
      content: createVariantDto.content || parentPage.content,
      views: 0,
      submissions: 0,
      conversionRate: 0,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.pageRepository.save(variant);
  }

  async getVariants(pageId: string, tenantId: string): Promise<Page[]> {
    return this.pageRepository.find({
      where: { parentPageId: pageId, tenantId },
    });
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const page = await this.findOne(id, tenantId);
    await this.pageRepository.softRemove(page);
  }

  async incrementViews(id: string): Promise<void> {
    await this.pageRepository.increment({ id }, 'views', 1);
  }

  async incrementSubmissions(id: string): Promise<void> {
    await this.pageRepository.increment({ id }, 'submissions', 1);
    await this.updateConversionRate(id);
  }

  private async updateConversionRate(id: string): Promise<void> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (page && page.views > 0) {
      const rate = (page.submissions / page.views) * 100;
      await this.pageRepository.update(id, {
        conversionRate: parseFloat(rate.toFixed(2)),
      });
    }
  }
}
