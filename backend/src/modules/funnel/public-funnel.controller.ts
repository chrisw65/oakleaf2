import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { FunnelService } from './funnel.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funnel } from './funnel.entity';
import { Page } from './page.entity';

@ApiTags('public')
@Controller('p')
@Public()
export class PublicFunnelController {
  constructor(
    private readonly funnelService: FunnelService,
    @InjectRepository(Funnel)
    private funnelRepository: Repository<Funnel>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  @Get(':funnelSlug')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get published funnel by slug (public)' })
  async getPublicFunnel(@Param('funnelSlug') funnelSlug: string) {
    const funnel = await this.funnelRepository.findOne({
      where: { slug: funnelSlug, status: 'active' as any },
      relations: ['pages'],
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found or not published');
    }

    // Return only published pages
    const publishedPages = funnel.pages.filter((p) => p.isPublished);

    return {
      id: funnel.id,
      name: funnel.name,
      slug: funnel.slug,
      description: funnel.description,
      theme: funnel.theme,
      settings: funnel.settings,
      pages: publishedPages.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        position: p.position,
      })),
    };
  }

  @Get(':funnelSlug/:pageSlug')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get published page by slug (public)' })
  async getPublicPage(
    @Param('funnelSlug') funnelSlug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    const funnel = await this.funnelRepository.findOne({
      where: { slug: funnelSlug, status: 'active' as any },
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found or not published');
    }

    const page = await this.pageRepository.findOne({
      where: {
        funnelId: funnel.id,
        slug: pageSlug,
        isPublished: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found or not published');
    }

    // Increment view count
    await this.pageRepository.increment({ id: page.id }, 'views', 1);

    return {
      id: page.id,
      name: page.name,
      slug: page.slug,
      type: page.type,
      content: page.content,
      styles: page.styles,
      settings: page.settings,
      seoSettings: page.seoSettings,
      funnel: {
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        theme: funnel.theme,
      },
    };
  }
}
