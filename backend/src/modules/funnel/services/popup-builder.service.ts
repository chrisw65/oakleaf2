import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagePopup } from '../page-popup.entity';
import { Page } from '../page.entity';
import {
  CreatePagePopupDto,
  UpdatePagePopupDto,
} from '../dto/page-popup.dto';

@Injectable()
export class PopupBuilderService {
  constructor(
    @InjectRepository(PagePopup)
    private readonly popupRepository: Repository<PagePopup>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async createPopup(
    tenantId: string,
    dto: CreatePagePopupDto,
  ): Promise<PagePopup> {
    const page = await this.pageRepository.findOne({
      where: { id: dto.pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const popup = this.popupRepository.create({
      ...dto,
      tenantId,
    });

    return await this.popupRepository.save(popup);
  }

  async updatePopup(
    tenantId: string,
    popupId: string,
    dto: UpdatePagePopupDto,
  ): Promise<PagePopup> {
    const popup = await this.popupRepository.findOne({
      where: { id: popupId, tenantId },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    Object.assign(popup, dto);
    return await this.popupRepository.save(popup);
  }

  async deletePopup(tenantId: string, popupId: string): Promise<void> {
    const popup = await this.popupRepository.findOne({
      where: { id: popupId, tenantId },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    await this.popupRepository.remove(popup);
  }

  async getPopups(
    tenantId: string,
    pageId?: string,
  ): Promise<PagePopup[]> {
    const where: any = { tenantId };

    if (pageId) {
      where.pageId = pageId;
    }

    return await this.popupRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getPopup(tenantId: string, popupId: string): Promise<PagePopup> {
    const popup = await this.popupRepository.findOne({
      where: { id: popupId, tenantId },
    });

    if (!popup) {
      throw new NotFoundException('Popup not found');
    }

    return popup;
  }

  async getActivePopups(
    tenantId: string,
    pageId: string,
  ): Promise<PagePopup[]> {
    return await this.popupRepository.find({
      where: {
        pageId,
        tenantId,
        isActive: true,
      },
      order: { order: 'ASC' },
    });
  }

  async trackPopupView(
    tenantId: string,
    popupId: string,
  ): Promise<void> {
    await this.popupRepository.increment(
      { id: popupId, tenantId },
      'views',
      1,
    );
  }

  async trackPopupConversion(
    tenantId: string,
    popupId: string,
  ): Promise<void> {
    const popup = await this.popupRepository.findOne({
      where: { id: popupId, tenantId },
    });

    if (!popup) return;

    popup.conversions += 1;

    // Update conversion rate
    if (popup.views > 0) {
      popup.conversionRate = (popup.conversions / popup.views) * 100;
    }

    await this.popupRepository.save(popup);
  }
}
