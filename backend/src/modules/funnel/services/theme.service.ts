import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageTheme, ThemeStatus } from '../page-theme.entity';
import { Funnel } from '../funnel.entity';
import { Page } from '../page.entity';
import {
  CreatePageThemeDto,
  UpdatePageThemeDto,
  ApplyThemeDto,
} from '../dto/page-theme.dto';

@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(PageTheme)
    private readonly themeRepository: Repository<PageTheme>,
    @InjectRepository(Funnel)
    private readonly funnelRepository: Repository<Funnel>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async createTheme(
    tenantId: string,
    userId: string,
    dto: CreatePageThemeDto,
  ): Promise<PageTheme> {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Check for unique slug
    const existing = await this.themeRepository.findOne({
      where: { slug, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Theme with this slug already exists');
    }

    const theme = this.themeRepository.create({
      ...dto,
      slug,
      createdBy: userId,
      tenantId,
    });

    return await this.themeRepository.save(theme);
  }

  async updateTheme(
    tenantId: string,
    themeId: string,
    dto: UpdatePageThemeDto,
  ): Promise<PageTheme> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId, tenantId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (dto.slug && dto.slug !== theme.slug) {
      const existing = await this.themeRepository.findOne({
        where: { slug: dto.slug, tenantId },
      });

      if (existing) {
        throw new BadRequestException('Theme with this slug already exists');
      }
    }

    Object.assign(theme, dto);
    return await this.themeRepository.save(theme);
  }

  async deleteTheme(tenantId: string, themeId: string): Promise<void> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId, tenantId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    await this.themeRepository.remove(theme);
  }

  async getThemes(
    tenantId: string,
    category?: string,
  ): Promise<PageTheme[]> {
    const where: any = [
      { tenantId, status: 'active' },
      { isPublic: true, status: 'active' },
    ];

    if (category) {
      where[0].category = category;
      where[1].category = category;
    }

    return await this.themeRepository.find({
      where,
      order: { isFeatured: 'DESC', usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async getTheme(tenantId: string, themeId: string): Promise<PageTheme> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    // Check if theme is accessible
    if (!theme.isPublic && theme.tenantId !== tenantId) {
      throw new BadRequestException('Theme not accessible');
    }

    return theme;
  }

  async applyTheme(
    tenantId: string,
    dto: ApplyThemeDto,
  ): Promise<Funnel | Page> {
    const theme = await this.getTheme(tenantId, dto.themeId);

    if (dto.targetType === 'funnel') {
      return await this.applyThemeToFunnel(tenantId, dto.targetId, theme);
    } else {
      return await this.applyThemeToPage(tenantId, dto.targetId, theme);
    }
  }

  private async applyThemeToFunnel(
    tenantId: string,
    funnelId: string,
    theme: PageTheme,
  ): Promise<Funnel> {
    const funnel = await this.funnelRepository.findOne({
      where: { id: funnelId, tenantId },
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    // Apply theme to all pages in the funnel
    const pages = await this.pageRepository.find({
      where: { funnelId, tenantId },
    });

    for (const page of pages) {
      await this.applyThemeStyles(page, theme);
      await this.pageRepository.save(page);
    }

    // Increment theme usage count
    theme.usageCount += 1;
    await this.themeRepository.save(theme);

    return funnel;
  }

  private async applyThemeToPage(
    tenantId: string,
    pageId: string,
    theme: PageTheme,
  ): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.applyThemeStyles(page, theme);
    const saved = await this.pageRepository.save(page);

    // Increment theme usage count
    theme.usageCount += 1;
    await this.themeRepository.save(theme);

    return saved;
  }

  private async applyThemeStyles(page: Page, theme: PageTheme): Promise<void> {
    // Merge theme styles with existing page styles
    page.styles = {
      ...page.styles,
      theme: {
        id: theme.id,
        name: theme.name,
        colors: theme.colors,
        typography: theme.typography,
        spacing: theme.spacing,
        borderRadius: theme.borderRadius,
        shadows: theme.shadows,
        breakpoints: theme.breakpoints,
        buttons: theme.buttons,
        forms: theme.forms,
        cards: theme.cards,
        globalStyles: theme.globalStyles,
        components: theme.components,
      },
      customCss: theme.customCss || page.styles?.customCss,
    };
  }

  async duplicateTheme(
    tenantId: string,
    themeId: string,
    name: string,
  ): Promise<PageTheme> {
    const sourceTheme = await this.getTheme(tenantId, themeId);

    const slug = this.generateSlug(name);

    // Check for unique slug
    const existing = await this.themeRepository.findOne({
      where: { slug, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Theme with this slug already exists');
    }

    const duplicatedTheme = this.themeRepository.create({
      ...sourceTheme,
      id: undefined,
      name,
      slug,
      tenantId,
      isPublic: false,
      isFeatured: false,
      usageCount: 0,
      status: ThemeStatus.DRAFT,
    });

    return await this.themeRepository.save(duplicatedTheme);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
