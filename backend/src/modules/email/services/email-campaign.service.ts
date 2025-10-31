import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailCampaign, CampaignStatus } from '../email-campaign.entity';
import { EmailLog, EmailStatus, EmailType } from '../email-log.entity';
import { Contact } from '../../crm/contact.entity';
import { Segment } from '../segment.entity';
import {
  CreateEmailCampaignDto,
  UpdateEmailCampaignDto,
  EmailCampaignQueryDto,
  SendCampaignDto,
} from '../dto/email-campaign.dto';
import { EmailTemplateService } from './email-template.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailCampaignService {
  private readonly logger = new Logger(EmailCampaignService.name);

  constructor(
    @InjectRepository(EmailCampaign)
    private readonly campaignRepository: Repository<EmailCampaign>,
    @InjectRepository(EmailLog)
    private readonly emailLogRepository: Repository<EmailLog>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Segment)
    private readonly segmentRepository: Repository<Segment>,
    private readonly templateService: EmailTemplateService,
  ) {}

  /**
   * Create a new campaign
   */
  async create(
    createDto: CreateEmailCampaignDto,
    tenantId: string,
    userId?: string,
  ): Promise<EmailCampaign> {
    const campaign = this.campaignRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Created campaign: ${saved.name}`);

    return saved;
  }

  /**
   * Find all campaigns
   */
  async findAll(
    queryDto: EmailCampaignQueryDto,
    tenantId: string,
  ): Promise<{ data: EmailCampaign[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.template', 'template')
      .leftJoinAndSelect('campaign.creator', 'creator')
      .where('campaign.tenantId = :tenantId', { tenantId })
      .andWhere('campaign.deletedAt IS NULL');

    if (queryDto.status) {
      queryBuilder.andWhere('campaign.status = :status', { status: queryDto.status });
    }

    if (queryDto.type) {
      queryBuilder.andWhere('campaign.type = :type', { type: queryDto.type });
    }

    if (queryDto.search) {
      queryBuilder.andWhere('campaign.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('campaign.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find campaign by ID
   */
  async findOne(id: string, tenantId: string): Promise<EmailCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, tenantId },
      relations: ['template', 'creator'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * Update campaign
   */
  async update(
    id: string,
    updateDto: UpdateEmailCampaignDto,
    tenantId: string,
  ): Promise<EmailCampaign> {
    const campaign = await this.findOne(id, tenantId);

    // Can't update sent campaigns
    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Cannot update a sent campaign');
    }

    Object.assign(campaign, updateDto);
    const updated = await this.campaignRepository.save(campaign);

    this.logger.log(`Updated campaign: ${updated.name}`);
    return updated;
  }

  /**
   * Delete campaign
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const campaign = await this.findOne(id, tenantId);

    // Can't delete sent campaigns
    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Cannot delete a sent campaign. Archive it instead.');
    }

    await this.campaignRepository.softDelete(id);
    this.logger.log(`Deleted campaign: ${campaign.name}`);
  }

  /**
   * Schedule or send campaign
   */
  async schedule(
    id: string,
    scheduleDto: SendCampaignDto,
    tenantId: string,
  ): Promise<EmailCampaign> {
    const campaign = await this.findOne(id, tenantId);

    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Campaign already sent');
    }

    // Calculate recipient count
    const recipients = await this.getRecipients(campaign, tenantId);
    campaign.recipientCount = recipients.length;

    if (campaign.recipientCount === 0) {
      throw new BadRequestException('No recipients found for this campaign');
    }

    if (scheduleDto.sendNow) {
      // Send immediately
      campaign.status = CampaignStatus.SENDING;
      campaign.scheduledAt = new Date();
      await this.campaignRepository.save(campaign);

      // Queue sending process (would be handled by a background job in production)
      await this.sendCampaign(campaign, recipients, tenantId);
    } else {
      // Schedule for later
      campaign.status = CampaignStatus.SCHEDULED;
      campaign.scheduledAt = scheduleDto.scheduledAt
        ? new Date(scheduleDto.scheduledAt)
        : campaign.scheduledAt;
      await this.campaignRepository.save(campaign);
    }

    this.logger.log(`Scheduled campaign: ${campaign.name} for ${campaign.recipientCount} recipients`);
    return campaign;
  }

  /**
   * Get campaign recipients based on targeting
   */
  async getRecipients(campaign: EmailCampaign, tenantId: string): Promise<Contact[]> {
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId })
      .andWhere('contact.deletedAt IS NULL')
      .andWhere('contact.unsubscribed = false');

    if (campaign.sendToAll) {
      // Send to all contacts
      return await queryBuilder.getMany();
    }

    // Apply segment filters
    if (campaign.segments && campaign.segments.length > 0) {
      // Get contacts from segments (simplified - would need proper segment evaluation)
      queryBuilder.andWhere('contact.id IN (SELECT contact_id FROM segment_contacts WHERE segment_id IN (:...segments))', {
        segments: campaign.segments,
      });
    }

    // Apply tag filters
    if (campaign.tags && campaign.tags.length > 0) {
      queryBuilder
        .leftJoin('contact.tags', 'tag')
        .andWhere('tag.id IN (:...tags)', { tags: campaign.tags });
    }

    // Exclude segments
    if (campaign.excludeSegments && campaign.excludeSegments.length > 0) {
      queryBuilder.andWhere('contact.id NOT IN (SELECT contact_id FROM segment_contacts WHERE segment_id IN (:...excludeSegments))', {
        excludeSegments: campaign.excludeSegments,
      });
    }

    // Exclude tags
    if (campaign.excludeTags && campaign.excludeTags.length > 0) {
      queryBuilder.andWhere('contact.id NOT IN (SELECT contact_id FROM contact_tags WHERE tag_id IN (:...excludeTags))', {
        excludeTags: campaign.excludeTags,
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Send campaign to recipients
   */
  private async sendCampaign(
    campaign: EmailCampaign,
    recipients: Contact[],
    tenantId: string,
  ): Promise<void> {
    const sendPromises: Promise<void>[] = [];

    for (const contact of recipients) {
      // Determine variant for A/B testing
      const variant = this.getVariant(campaign, contact);

      const emailLog = this.emailLogRepository.create({
        tenantId,
        contactId: contact.id,
        emailType: EmailType.CAMPAIGN,
        campaignId: campaign.id,
        status: EmailStatus.PENDING,
        recipientEmail: contact.email,
        recipientName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        subject: variant === 'B' && campaign.subjectVariantB
          ? campaign.subjectVariantB
          : campaign.subject,
        fromEmail: campaign.fromEmail,
        fromName: campaign.fromName,
        htmlContent: variant === 'B' && campaign.htmlContentVariantB
          ? campaign.htmlContentVariantB
          : campaign.htmlContent,
        textContent: campaign.textContent,
        trackingId: uuidv4(),
        variant,
      });

      sendPromises.push(
        this.emailLogRepository.save(emailLog).then(() => {
          // Here we would integrate with an actual email service provider
          // For now, just mark as sent
          this.updateEmailStatus(emailLog.id, EmailStatus.SENT, tenantId);
        }),
      );
    }

    await Promise.all(sendPromises);

    // Update campaign status
    campaign.status = CampaignStatus.SENT;
    campaign.sentAt = new Date();
    campaign.sentCount = recipients.length;
    await this.campaignRepository.save(campaign);

    this.logger.log(`Sent campaign: ${campaign.name} to ${recipients.length} recipients`);
  }

  /**
   * Determine variant for A/B testing
   */
  private getVariant(campaign: EmailCampaign, contact: Contact): string {
    if (campaign.type !== 'ab_test' || !campaign.abTestPercentage) {
      return 'A';
    }

    // Simple hash-based distribution
    const hash = contact.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const percentage = hash % 100;

    return percentage < campaign.abTestPercentage ? 'B' : 'A';
  }

  /**
   * Update email status
   */
  private async updateEmailStatus(
    emailLogId: string,
    status: EmailStatus,
    tenantId: string,
  ): Promise<void> {
    await this.emailLogRepository.update(
      { id: emailLogId, tenantId },
      { status, sentAt: new Date() },
    );
  }

  /**
   * Get campaign statistics
   */
  async getStatistics(
    id: string,
    tenantId: string,
  ): Promise<{
    campaign: EmailCampaign;
    deliveryRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  }> {
    const campaign = await this.findOne(id, tenantId);

    const deliveryRate = campaign.sentCount > 0
      ? (campaign.deliveredCount / campaign.sentCount) * 100
      : 0;

    const bounceRate = campaign.sentCount > 0
      ? (campaign.bouncedCount / campaign.sentCount) * 100
      : 0;

    const unsubscribeRate = campaign.sentCount > 0
      ? (campaign.unsubscribedCount / campaign.sentCount) * 100
      : 0;

    return {
      campaign,
      deliveryRate: parseFloat(deliveryRate.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      unsubscribeRate: parseFloat(unsubscribeRate.toFixed(2)),
    };
  }
}
