// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageElement } from '../page-element.entity';
import { PageBlock } from '../page-block.entity';
import { Page } from '../page.entity';
import {
  CreatePageElementDto,
  UpdatePageElementDto,
  DuplicatePageElementDto,
  ReorderPageElementsDto,
} from '../dto/page-element.dto';
import {
  CreatePageBlockDto,
  UpdatePageBlockDto,
  AddBlockToPageDto,
} from '../dto/page-block.dto';

@Injectable()
export class PageBuilderService {
  constructor(
    @InjectRepository(PageElement)
    private readonly elementRepository: Repository<PageElement>,
    @InjectRepository(PageBlock)
    private readonly blockRepository: Repository<PageBlock>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  // ==================== Page Elements ====================

  async createElement(
    tenantId: string,
    dto: CreatePageElementDto,
  ): Promise<PageElement> {
    const page = await this.pageRepository.findOne({
      where: { id: dto.pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const element = this.elementRepository.create({
      ...dto,
      tenantId,
    });

    return await this.elementRepository.save(element);
  }

  async updateElement(
    tenantId: string,
    elementId: string,
    dto: UpdatePageElementDto,
  ): Promise<PageElement> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId, tenantId },
    });

    if (!element) {
      throw new NotFoundException('Element not found');
    }

    Object.assign(element, dto);
    return await this.elementRepository.save(element);
  }

  async deleteElement(tenantId: string, elementId: string): Promise<void> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId, tenantId },
    });

    if (!element) {
      throw new NotFoundException('Element not found');
    }

    // Delete child elements first
    await this.elementRepository.delete({
      parentId: elementId,
      tenantId,
    });

    await this.elementRepository.remove(element);
  }

  async duplicateElement(
    tenantId: string,
    dto: DuplicatePageElementDto,
  ): Promise<PageElement> {
    const sourceElement = await this.elementRepository.findOne({
      where: { id: dto.elementId, tenantId },
    });

    if (!sourceElement) {
      throw new NotFoundException('Source element not found');
    }

    const targetPageId = dto.targetPageId || sourceElement.pageId;

    // @ts-ignore - TypeORM type issue
    const duplicatedElement = this.elementRepository.create({
      ...sourceElement,
      id: undefined,
      pageId: targetPageId,
      elementName: `${sourceElement.elementName} (Copy)`,
      order: sourceElement.order + 1,
    });

    return await this.elementRepository.save(duplicatedElement);
  }

  async reorderElements(
    tenantId: string,
    pageId: string,
    dto: ReorderPageElementsDto,
  ): Promise<PageElement[]> {
    const elements = await this.elementRepository.find({
      where: { pageId, tenantId },
    });

    // Update order for each element
    const updates = dto.elementIds.map((elementId, index) => {
      const element = elements.find((e) => e.id === elementId);
      if (element) {
        element.order = index;
        return element;
      }
    }).filter(Boolean);

    return await this.elementRepository.save(updates as PageElement[]);
  }

  async getPageElements(
    tenantId: string,
    pageId: string,
  ): Promise<PageElement[]> {
    return await this.elementRepository.find({
      where: { pageId, tenantId },
      order: { order: 'ASC' },
    });
  }

  async getElement(tenantId: string, elementId: string): Promise<PageElement> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId, tenantId },
    });

    if (!element) {
      throw new NotFoundException('Element not found');
    }

    return element;
  }

  // ==================== Page Blocks ====================

  async createBlock(
    tenantId: string,
    dto: CreatePageBlockDto,
  ): Promise<PageBlock> {
    // Generate slug if not provided
    const slug = dto.slug || this.generateSlug(dto.name);

    // Check for unique slug
    const existing = await this.blockRepository.findOne({
      where: { slug, tenantId },
    });

    if (existing) {
      throw new BadRequestException('Block with this slug already exists');
    }

    const block = this.blockRepository.create({
      ...dto,
      slug,
      tenantId,
    });

    return await this.blockRepository.save(block);
  }

  async updateBlock(
    tenantId: string,
    blockId: string,
    dto: UpdatePageBlockDto,
  ): Promise<PageBlock> {
    const block = await this.blockRepository.findOne({
      where: { id: blockId, tenantId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== block.slug) {
      const existing = await this.blockRepository.findOne({
        where: { slug: dto.slug, tenantId },
      });

      if (existing) {
        throw new BadRequestException('Block with this slug already exists');
      }
    }

    Object.assign(block, dto);
    return await this.blockRepository.save(block);
  }

  async deleteBlock(tenantId: string, blockId: string): Promise<void> {
    const block = await this.blockRepository.findOne({
      where: { id: blockId, tenantId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await this.blockRepository.remove(block);
  }

  async getBlocks(
    tenantId: string,
    category?: string,
  ): Promise<PageBlock[]> {
    const where: any = { tenantId };

    if (category) {
      where.category = category;
    }

    return await this.blockRepository.find({
      where,
      order: { usageCount: 'DESC', createdAt: 'DESC' },
    });
  }

  async getBlock(tenantId: string, blockId: string): Promise<PageBlock> {
    const block = await this.blockRepository.findOne({
      where: { id: blockId, tenantId },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  async addBlockToPage(
    tenantId: string,
    dto: AddBlockToPageDto,
  ): Promise<PageElement[]> {
    const block = await this.getBlock(tenantId, dto.blockId);
    const page = await this.pageRepository.findOne({
      where: { id: dto.pageId, tenantId },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Get existing elements to calculate order
    const existingElements = await this.elementRepository.find({
      where: { pageId: dto.pageId, tenantId },
      order: { order: 'ASC' },
    });

    const position = dto.position || existingElements.length;

    // Create elements from block structure
      // @ts-ignore - TypeORM type issue
    const elements = block.structure.elements.map((el: any, index: number) => {
      return this.elementRepository.create({
        pageId: dto.pageId,
        tenantId,
        elementType: el.elementType,
        content: el.content || {},
        styles: el.styles || {},
        order: position + index,
        elementName: el.name || `Block ${block.name} - Element ${index + 1}`,
      });
    });

    const savedElements = await this.elementRepository.save(elements);

    // Increment block usage count
    block.usageCount += 1;
    await this.blockRepository.save(block);

    return savedElements;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
