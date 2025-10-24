import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funnel, FunnelStatus } from './funnel.entity';
import { Page } from './page.entity';
import { CreateFunnelDto, UpdateFunnelDto, CloneFunnelDto } from './dto/funnel.dto';

@Injectable()
export class FunnelService {
  constructor(
    @InjectRepository(Funnel)
    private funnelRepository: Repository<Funnel>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async create(createFunnelDto: CreateFunnelDto, tenantId: string, userId: string): Promise<Funnel> {
    // Check if slug already exists for this tenant
    const existing = await this.funnelRepository.findOne({
      where: { slug: createFunnelDto.slug, tenantId },
    });

    if (existing) {
      throw new ConflictException('Funnel slug already exists');
    }

    const funnel = this.funnelRepository.create({
      ...createFunnelDto,
      tenantId,
      createdBy: userId,
      status: FunnelStatus.DRAFT,
    });

    return this.funnelRepository.save(funnel);
  }

  async findAll(tenantId: string, status?: FunnelStatus): Promise<Funnel[]> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return this.funnelRepository.find({
      where,
      relations: ['pages', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Funnel> {
    const funnel = await this.funnelRepository.findOne({
      where: { id, tenantId },
      relations: ['pages', 'creator'],
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    return funnel;
  }

  async findBySlug(slug: string, tenantId: string): Promise<Funnel> {
    const funnel = await this.funnelRepository.findOne({
      where: { slug, tenantId },
      relations: ['pages'],
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    return funnel;
  }

  async update(id: string, updateFunnelDto: UpdateFunnelDto, tenantId: string): Promise<Funnel> {
    const funnel = await this.findOne(id, tenantId);

    // Check slug uniqueness if being updated
    if (updateFunnelDto.slug && updateFunnelDto.slug !== funnel.slug) {
      const existing = await this.funnelRepository.findOne({
        where: { slug: updateFunnelDto.slug, tenantId },
      });
      if (existing) {
        throw new ConflictException('Funnel slug already exists');
      }
    }

    Object.assign(funnel, updateFunnelDto);
    funnel.lastEditedAt = new Date();

    return this.funnelRepository.save(funnel);
  }

  async publish(id: string, tenantId: string): Promise<Funnel> {
    const funnel = await this.findOne(id, tenantId);

    // Check if funnel has at least one page
    if (!funnel.pages || funnel.pages.length === 0) {
      throw new ForbiddenException('Cannot publish a funnel without pages');
    }

    funnel.status = FunnelStatus.ACTIVE;
    funnel.publishedAt = new Date();

    return this.funnelRepository.save(funnel);
  }

  async unpublish(id: string, tenantId: string): Promise<Funnel> {
    const funnel = await this.findOne(id, tenantId);
    funnel.status = FunnelStatus.PAUSED;

    return this.funnelRepository.save(funnel);
  }

  async clone(id: string, cloneFunnelDto: CloneFunnelDto, tenantId: string, userId: string): Promise<Funnel> {
    const originalFunnel = await this.findOne(id, tenantId);

    // Check slug uniqueness
    const slug = cloneFunnelDto.slug || `${originalFunnel.slug}-copy`;
    const existing = await this.funnelRepository.findOne({
      where: { slug, tenantId },
    });
    if (existing) {
      throw new ConflictException('Funnel slug already exists');
    }

    // Clone funnel
    const newFunnel = this.funnelRepository.create({
      ...originalFunnel,
      id: undefined,
      name: cloneFunnelDto.name,
      slug,
      createdBy: userId,
      status: FunnelStatus.DRAFT,
      publishedAt: undefined,
      views: 0,
      conversions: 0,
      conversionRate: 0,
      createdAt: undefined,
      updatedAt: undefined,
      pages: undefined, // Remove pages array from the cloned object
    });

    const savedFunnel: Funnel = await this.funnelRepository.save(newFunnel);

    // Clone pages
    if (originalFunnel.pages && originalFunnel.pages.length > 0) {
      const newPages = originalFunnel.pages.map(page => {
        const newPage = this.pageRepository.create({
          ...page,
          id: undefined,
          funnelId: savedFunnel.id,
          tenantId,
          views: 0,
          submissions: 0,
          conversionRate: 0,
          isPublished: false,
          publishedAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        });
        return newPage;
      });

      await this.pageRepository.save(newPages);
    }

    return this.findOne(savedFunnel.id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const funnel = await this.findOne(id, tenantId);
    await this.funnelRepository.softRemove(funnel);
  }

  async incrementViews(id: string): Promise<void> {
    await this.funnelRepository.increment({ id }, 'views', 1);
  }

  async incrementConversions(id: string): Promise<void> {
    await this.funnelRepository.increment({ id }, 'conversions', 1);
    await this.updateConversionRate(id);
  }

  private async updateConversionRate(id: string): Promise<void> {
    const funnel = await this.funnelRepository.findOne({ where: { id } });
    if (funnel && funnel.views > 0) {
      const rate = (funnel.conversions / funnel.views) * 100;
      await this.funnelRepository.update(id, {
        conversionRate: parseFloat(rate.toFixed(2)),
      });
    }
  }

  async getStats(id: string, tenantId: string): Promise<any> {
    const funnel = await this.findOne(id, tenantId);

    return {
      id: funnel.id,
      name: funnel.name,
      views: funnel.views,
      conversions: funnel.conversions,
      conversionRate: funnel.conversionRate,
      pages: funnel.pages.map(page => ({
        id: page.id,
        name: page.name,
        views: page.views,
        submissions: page.submissions,
        conversionRate: page.conversionRate,
      })),
    };
  }
}
