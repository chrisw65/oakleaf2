import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Segment, SegmentType } from '../segment.entity';
import { Contact } from '../../crm/contact.entity';
import {
  CreateSegmentDto,
  UpdateSegmentDto,
  SegmentQueryDto,
  AddContactsToSegmentDto,
  RemoveContactsFromSegmentDto,
} from '../dto/segment.dto';

@Injectable()
export class SegmentService {
  private readonly logger = new Logger(SegmentService.name);

  constructor(
    @InjectRepository(Segment)
    private readonly segmentRepository: Repository<Segment>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Create a new segment
   */
  async create(
    createDto: CreateSegmentDto,
    tenantId: string,
    userId?: string,
  ): Promise<Segment> {
    const segment = this.segmentRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.segmentRepository.save(segment);

    // Calculate initial contact count
    if (saved.type === SegmentType.DYNAMIC) {
      await this.updateContactCount(saved.id, tenantId);
    }

    this.logger.log(`Created segment: ${saved.name}`);
    return await this.findOne(saved.id, tenantId);
  }

  /**
   * Find all segments
   */
  async findAll(
    queryDto: SegmentQueryDto,
    tenantId: string,
  ): Promise<{ data: Segment[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.creator', 'creator')
      .where('segment.tenantId = :tenantId', { tenantId })
      .andWhere('segment.deletedAt IS NULL');

    if (queryDto.type) {
      queryBuilder.andWhere('segment.type = :type', { type: queryDto.type });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('segment.status = :status', { status: queryDto.status });
    }

    if (queryDto.search) {
      queryBuilder.andWhere('segment.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('segment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find segment by ID
   */
  async findOne(id: string, tenantId: string): Promise<Segment> {
    const segment = await this.segmentRepository.findOne({
      where: { id, tenantId },
      relations: ['creator'],
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return segment;
  }

  /**
   * Update segment
   */
  async update(
    id: string,
    updateDto: UpdateSegmentDto,
    tenantId: string,
  ): Promise<Segment> {
    const segment = await this.findOne(id, tenantId);

    Object.assign(segment, updateDto);
    const updated = await this.segmentRepository.save(segment);

    // Recalculate contact count if conditions changed
    if (updated.type === SegmentType.DYNAMIC && updateDto.conditions) {
      await this.updateContactCount(updated.id, tenantId);
    }

    this.logger.log(`Updated segment: ${updated.name}`);
    return await this.findOne(updated.id, tenantId);
  }

  /**
   * Delete segment
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const segment = await this.findOne(id, tenantId);
    await this.segmentRepository.softDelete(id);
    this.logger.log(`Deleted segment: ${segment.name}`);
  }

  /**
   * Add contacts to static segment
   */
  async addContacts(
    id: string,
    addDto: AddContactsToSegmentDto,
    tenantId: string,
  ): Promise<Segment> {
    const segment = await this.findOne(id, tenantId);

    if (segment.type !== SegmentType.STATIC) {
      throw new Error('Can only add contacts to static segments');
    }

    // Add new contact IDs (avoid duplicates)
    const existingIds = new Set(segment.contactIds || []);
    for (const contactId of addDto.contactIds) {
      existingIds.add(contactId);
    }

    segment.contactIds = Array.from(existingIds);
    segment.contactCount = segment.contactIds.length;

    const updated = await this.segmentRepository.save(segment);
    this.logger.log(`Added ${addDto.contactIds.length} contacts to segment ${updated.name}`);

    return updated;
  }

  /**
   * Remove contacts from static segment
   */
  async removeContacts(
    id: string,
    removeDto: RemoveContactsFromSegmentDto,
    tenantId: string,
  ): Promise<Segment> {
    const segment = await this.findOne(id, tenantId);

    if (segment.type !== SegmentType.STATIC) {
      throw new Error('Can only remove contacts from static segments');
    }

    // Remove contact IDs
    const idsToRemove = new Set(removeDto.contactIds);
    segment.contactIds = (segment.contactIds || []).filter(id => !idsToRemove.has(id));
    segment.contactCount = segment.contactIds.length;

    const updated = await this.segmentRepository.save(segment);
    this.logger.log(`Removed ${removeDto.contactIds.length} contacts from segment ${updated.name}`);

    return updated;
  }

  /**
   * Get contacts in segment
   */
  async getContacts(
    id: string,
    tenantId: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: Contact[]; total: number }> {
    const segment = await this.findOne(id, tenantId);

    if (segment.type === SegmentType.STATIC) {
      // For static segments, just return the contacts by ID
      const skip = (page - 1) * limit;
      const contactIds = segment.contactIds || [];
      const paginatedIds = contactIds.slice(skip, skip + limit);

      const contacts = await this.contactRepository.findByIds(paginatedIds);

      return {
        data: contacts,
        total: contactIds.length,
      };
    } else {
      // For dynamic segments, evaluate conditions
      // This is a simplified version - full implementation would handle all condition types
      const queryBuilder = this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.tenantId = :tenantId', { tenantId })
        .andWhere('contact.deletedAt IS NULL');

      // Apply segment conditions (simplified)
      if (segment.conditions) {
        // Add condition logic here based on segment.conditions
        // For now, just return all contacts
      }

      const skip = (page - 1) * limit;
      const [data, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { data, total };
    }
  }

  /**
   * Update contact count for dynamic segment
   */
  async updateContactCount(id: string, tenantId: string): Promise<void> {
    const segment = await this.findOne(id, tenantId);

    if (segment.type === SegmentType.DYNAMIC) {
      // Evaluate conditions and count matching contacts
      // Simplified version - full implementation would handle all condition types
      const count = await this.contactRepository.count({
        where: { tenantId },
      });

      await this.segmentRepository.update(
        { id, tenantId },
        {
          contactCount: count,
          lastCalculatedAt: new Date(),
        },
      );
    }
  }

  /**
   * Get segment statistics
   */
  async getStatistics(tenantId: string): Promise<{
    total: number;
    byType: any[];
    largest: Segment[];
  }> {
    const total = await this.segmentRepository.count({
      where: { tenantId },
    });

    const byType = await this.segmentRepository
      .createQueryBuilder('segment')
      .select('segment.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('segment.tenantId = :tenantId', { tenantId })
      .groupBy('segment.type')
      .getRawMany();

    const largest = await this.segmentRepository.find({
      where: { tenantId },
      order: { contactCount: 'DESC' },
      take: 10,
    });

    return {
      total,
      byType,
      largest,
    };
  }
}
