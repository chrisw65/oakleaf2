import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ContactActivity } from '../contact.entity';

export class CreateActivityDto {
  contactId: string;
  activityType: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
  occurredAt?: Date;
}

export class ActivityFilterDto {
  activityType?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class ContactActivityService {
  constructor(
    @InjectRepository(ContactActivity)
    private activityRepository: Repository<ContactActivity>,
  ) {}

  /**
   * Create a new activity for a contact
   */
  async create(
    createActivityDto: CreateActivityDto,
    tenantId: string,
  ): Promise<ContactActivity> {
    const activity = this.activityRepository.create({
      ...createActivityDto,
      tenantId,
      occurredAt: createActivityDto.occurredAt || new Date(),
    });

    return await this.activityRepository.save(activity);
  }

  /**
   * Get all activities for a contact with filtering and pagination
   */
  async findByContact(
    contactId: string,
    tenantId: string,
    filters?: ActivityFilterDto,
  ): Promise<{ data: ContactActivity[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ContactActivity> = {
      contactId,
      tenantId,
    };

    if (filters?.activityType) {
      where.activityType = filters.activityType;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.contactId = :contactId', { contactId })
      .andWhere('activity.tenantId = :tenantId', { tenantId });

    if (filters?.activityType) {
      query.andWhere('activity.activityType = :activityType', {
        activityType: filters.activityType,
      });
    }

    if (filters?.userId) {
      query.andWhere('activity.userId = :userId', { userId: filters.userId });
    }

    if (filters?.fromDate) {
      query.andWhere('activity.occurredAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters?.toDate) {
      query.andWhere('activity.occurredAt <= :toDate', {
        toDate: filters.toDate,
      });
    }

    query
      .leftJoinAndSelect('activity.user', 'user')
      .orderBy('activity.occurredAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single activity by ID
   */
  async findOne(id: string, tenantId: string): Promise<ContactActivity> {
    const activity = await this.activityRepository.findOne({
      where: { id, tenantId },
      relations: ['contact', 'user'],
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  /**
   * Update an activity
   */
  async update(
    id: string,
    tenantId: string,
    updateData: Partial<CreateActivityDto>,
  ): Promise<ContactActivity> {
    const activity = await this.findOne(id, tenantId);

    Object.assign(activity, updateData);

    return await this.activityRepository.save(activity);
  }

  /**
   * Delete an activity
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const activity = await this.findOne(id, tenantId);
    await this.activityRepository.remove(activity);
  }

  /**
   * Get activity statistics for a contact
   */
  async getContactActivityStats(
    contactId: string,
    tenantId: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    lastActivityDate: Date | null;
    recentActivities: ContactActivity[];
  }> {
    const activities = await this.activityRepository.find({
      where: { contactId, tenantId },
      order: { occurredAt: 'DESC' },
    });

    const byType: Record<string, number> = {};
    activities.forEach((activity) => {
      byType[activity.activityType] = (byType[activity.activityType] || 0) + 1;
    });

    return {
      total: activities.length,
      byType,
      lastActivityDate: activities.length > 0 ? activities[0].occurredAt : null,
      recentActivities: activities.slice(0, 10),
    };
  }

  /**
   * Get activity statistics by type for tenant
   */
  async getActivityStatsByType(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<Record<string, number>> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('activity.tenantId = :tenantId', { tenantId })
      .groupBy('activity.activityType');

    if (fromDate) {
      query.andWhere('activity.occurredAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('activity.occurredAt <= :toDate', { toDate });
    }

    const results = await query.getRawMany();

    const stats: Record<string, number> = {};
    results.forEach((result) => {
      stats[result.type] = parseInt(result.count, 10);
    });

    return stats;
  }

  /**
   * Bulk create activities (useful for imports or batch operations)
   */
  async bulkCreate(
    activities: CreateActivityDto[],
    tenantId: string,
  ): Promise<ContactActivity[]> {
    const activityEntities = activities.map((dto) =>
      this.activityRepository.create({
        ...dto,
        tenantId,
        occurredAt: dto.occurredAt || new Date(),
      }),
    );

    return await this.activityRepository.save(activityEntities);
  }

  /**
   * Log a form submission activity
   */
  async logFormSubmission(
    contactId: string,
    formId: string,
    pageId: string,
    formData: Record<string, any>,
    tenantId: string,
  ): Promise<ContactActivity> {
    return await this.create(
      {
        contactId,
        activityType: 'form_submitted',
        title: 'Form Submitted',
        description: `Submitted a form`,
        metadata: {
          formId,
          pageId,
          formData,
        },
      },
      tenantId,
    );
  }

  /**
   * Log an email activity
   */
  async logEmailActivity(
    contactId: string,
    emailId: string,
    activityType: 'email_sent' | 'email_opened' | 'email_clicked' | 'email_bounced',
    tenantId: string,
    metadata?: Record<string, any>,
  ): Promise<ContactActivity> {
    const titles = {
      email_sent: 'Email Sent',
      email_opened: 'Email Opened',
      email_clicked: 'Email Clicked',
      email_bounced: 'Email Bounced',
    };

    return await this.create(
      {
        contactId,
        activityType,
        title: titles[activityType],
        metadata: {
          emailId,
          ...metadata,
        },
      },
      tenantId,
    );
  }

  /**
   * Log a page view activity
   */
  async logPageView(
    contactId: string,
    pageId: string,
    pageUrl: string,
    tenantId: string,
    metadata?: Record<string, any>,
  ): Promise<ContactActivity> {
    return await this.create(
      {
        contactId,
        activityType: 'page_viewed',
        title: 'Page Viewed',
        description: pageUrl,
        metadata: {
          pageId,
          pageUrl,
          ...metadata,
        },
      },
      tenantId,
    );
  }

  /**
   * Log a note added activity
   */
  async logNoteAdded(
    contactId: string,
    noteId: string,
    noteContent: string,
    userId: string,
    tenantId: string,
  ): Promise<ContactActivity> {
    return await this.create(
      {
        contactId,
        activityType: 'note_added',
        title: 'Note Added',
        description: noteContent.substring(0, 200), // First 200 chars
        userId,
        metadata: {
          noteId,
        },
      },
      tenantId,
    );
  }
}
