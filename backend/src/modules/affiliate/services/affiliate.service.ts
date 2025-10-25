import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate, AffiliateStatus } from '../affiliate.entity';
import { CommissionPlan } from '../commission-plan.entity';
import {
  RegisterAffiliateDto,
  UpdateAffiliateDto,
  GenerateAffiliateLinkDto,
  AffiliateStatsQueryDto,
} from '../dto/affiliate.dto';
import { CommissionService } from './commission.service';
import { AffiliateTrackingService } from './affiliate-tracking.service';

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(CommissionPlan)
    private readonly commissionPlanRepository: Repository<CommissionPlan>,
    private readonly commissionService: CommissionService,
    private readonly trackingService: AffiliateTrackingService,
  ) {}

  /**
   * Register a new affiliate
   */
  async register(
    registerDto: RegisterAffiliateDto,
    userId: string,
    tenantId: string,
  ): Promise<Affiliate> {
    // Check if user is already an affiliate
    const existing = await this.affiliateRepository.findOne({
      where: { userId, tenantId },
    });

    if (existing) {
      throw new ConflictException('User is already registered as an affiliate');
    }

    // Generate unique affiliate code
    const affiliateCode = registerDto.preferredCode
      ? await this.ensureUniqueCode(registerDto.preferredCode, tenantId)
      : await this.generateUniqueCode(tenantId);

    // Get commission plan
    let commissionPlan: CommissionPlan | undefined = undefined;
    if (registerDto.commissionPlanId) {
      commissionPlan =
        (await this.commissionPlanRepository.findOne({
          where: { id: registerDto.commissionPlanId, tenantId },
        })) || undefined;
    } else {
      // Get default plan
      commissionPlan =
        (await this.commissionPlanRepository.findOne({
          where: { tenantId, isDefault: true, isActive: true },
        })) || undefined;
    }

    // Handle parent affiliate (for sub-affiliates)
    let parentAffiliateId: string | undefined = undefined;
    if (registerDto.parentAffiliateCode) {
      const parentAffiliate = await this.affiliateRepository.findOne({
        where: { affiliateCode: registerDto.parentAffiliateCode, tenantId },
      });

      if (!parentAffiliate) {
        throw new BadRequestException('Parent affiliate not found');
      }

      parentAffiliateId = parentAffiliate.id;
    }

    // Determine initial status based on commission plan settings
    const requireApproval =
      commissionPlan?.settings?.requireApproval !== false;
    const status = requireApproval
      ? AffiliateStatus.PENDING
      : AffiliateStatus.ACTIVE;

    // Create affiliate
    const affiliate = this.affiliateRepository.create({
      tenantId,
      userId,
      affiliateCode,
      parentAffiliateId,
      commissionPlanId: commissionPlan?.id,
      status,
      paymentInfo: {
        method: registerDto.paymentMethod,
        email: registerDto.paymentEmail,
        bankAccount: registerDto.bankAccount,
      },
      metadata: {
        companyName: registerDto.companyName,
        website: registerDto.website,
        socialMedia: registerDto.socialMedia,
        notes: registerDto.notes,
      },
    });

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(
      `Registered new affiliate ${saved.affiliateCode} for user ${userId}`,
    );

    return saved;
  }

  /**
   * Find all affiliates with filters
   */
  async findAll(
    tenantId: string,
    status?: AffiliateStatus,
  ): Promise<Affiliate[]> {
    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    return this.affiliateRepository.find({
      where,
      relations: ['user', 'commissionPlan', 'parentAffiliate'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one affiliate by ID
   */
  async findOne(id: string, tenantId: string): Promise<Affiliate> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id, tenantId },
      relations: ['user', 'commissionPlan', 'parentAffiliate', 'subAffiliates'],
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate with ID ${id} not found`);
    }

    return affiliate;
  }

  /**
   * Find affiliate by code
   */
  async findByCode(code: string, tenantId: string): Promise<Affiliate> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { affiliateCode: code, tenantId },
      relations: ['user', 'commissionPlan'],
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate with code ${code} not found`);
    }

    return affiliate;
  }

  /**
   * Find affiliate by user ID
   */
  async findByUserId(userId: string, tenantId: string): Promise<Affiliate | null> {
    return this.affiliateRepository.findOne({
      where: { userId, tenantId },
      relations: ['commissionPlan', 'parentAffiliate'],
    });
  }

  /**
   * Update affiliate
   */
  async update(
    id: string,
    updateDto: UpdateAffiliateDto,
    tenantId: string,
  ): Promise<Affiliate> {
    const affiliate = await this.findOne(id, tenantId);

    if (updateDto.status) {
      affiliate.status = updateDto.status;
    }

    if (updateDto.commissionPlanId) {
      affiliate.commissionPlanId = updateDto.commissionPlanId;
    }

    if (updateDto.paymentInfo) {
      affiliate.paymentInfo = {
        ...affiliate.paymentInfo,
        ...updateDto.paymentInfo,
      };
    }

    if (updateDto.metadata) {
      affiliate.metadata = {
        ...affiliate.metadata,
        ...updateDto.metadata,
      };
    }

    return this.affiliateRepository.save(affiliate);
  }

  /**
   * Approve affiliate
   */
  async approve(id: string, tenantId: string): Promise<Affiliate> {
    const affiliate = await this.findOne(id, tenantId);

    if (affiliate.status !== AffiliateStatus.PENDING) {
      throw new BadRequestException('Only pending affiliates can be approved');
    }

    affiliate.status = AffiliateStatus.ACTIVE;

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Approved affiliate ${affiliate.affiliateCode}`);

    return saved;
  }

  /**
   * Reject affiliate
   */
  async reject(id: string, tenantId: string, reason: string): Promise<Affiliate> {
    const affiliate = await this.findOne(id, tenantId);

    if (affiliate.status !== AffiliateStatus.PENDING) {
      throw new BadRequestException('Only pending affiliates can be rejected');
    }

    affiliate.status = AffiliateStatus.REJECTED;
    affiliate.metadata = {
      ...affiliate.metadata,
      rejectionReason: reason,
    };

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Rejected affiliate ${affiliate.affiliateCode}: ${reason}`);

    return saved;
  }

  /**
   * Suspend affiliate
   */
  async suspend(id: string, tenantId: string, reason: string): Promise<Affiliate> {
    const affiliate = await this.findOne(id, tenantId);

    affiliate.status = AffiliateStatus.SUSPENDED;
    affiliate.metadata = {
      ...affiliate.metadata,
      suspensionReason: reason,
    };

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Suspended affiliate ${affiliate.affiliateCode}: ${reason}`);

    return saved;
  }

  /**
   * Reactivate affiliate
   */
  async reactivate(id: string, tenantId: string): Promise<Affiliate> {
    const affiliate = await this.findOne(id, tenantId);

    if (
      affiliate.status !== AffiliateStatus.SUSPENDED &&
      affiliate.status !== AffiliateStatus.INACTIVE
    ) {
      throw new BadRequestException(
        'Only suspended or inactive affiliates can be reactivated',
      );
    }

    affiliate.status = AffiliateStatus.ACTIVE;

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Reactivated affiliate ${affiliate.affiliateCode}`);

    return saved;
  }

  /**
   * Generate affiliate link
   */
  async generateLink(
    id: string,
    generateDto: GenerateAffiliateLinkDto,
    tenantId: string,
  ): Promise<string> {
    const affiliate = await this.findOne(id, tenantId);

    const url = new URL(generateDto.url);
    url.searchParams.set('ref', affiliate.affiliateCode);

    if (generateDto.utmSource) {
      url.searchParams.set('utm_source', generateDto.utmSource);
    }
    if (generateDto.utmMedium) {
      url.searchParams.set('utm_medium', generateDto.utmMedium);
    }
    if (generateDto.utmCampaign) {
      url.searchParams.set('utm_campaign', generateDto.utmCampaign);
    }

    return url.toString();
  }

  /**
   * Get affiliate dashboard statistics
   */
  async getStats(
    id: string,
    tenantId: string,
    queryDto?: AffiliateStatsQueryDto,
  ): Promise<any> {
    const affiliate = await this.findOne(id, tenantId);

    const days = queryDto?.days || 30;
    let startDate = queryDto?.startDate
      ? new Date(queryDto.startDate)
      : new Date();
    startDate.setDate(startDate.getDate() - days);

    const endDate = queryDto?.endDate ? new Date(queryDto.endDate) : new Date();

    // Get click stats
    const clickStats = await this.trackingService.getClickStats(
      id,
      tenantId,
      startDate,
      endDate,
    );

    // Get commission stats
    const commissionStats = await this.commissionService.getStats(
      id,
      tenantId,
      startDate,
      endDate,
    );

    return {
      affiliate: {
        code: affiliate.affiliateCode,
        status: affiliate.status,
        totalEarnings: affiliate.totalEarnings,
        totalPaid: affiliate.totalPaid,
        pendingBalance: affiliate.pendingBalance,
      },
      clicks: clickStats,
      commissions: commissionStats,
      period: {
        startDate,
        endDate,
        days,
      },
    };
  }

  /**
   * Generate unique affiliate code
   */
  private async generateUniqueCode(tenantId: string): Promise<string> {
    let code: string;
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      code = this.generateRandomCode();
      const existing = await this.affiliateRepository.findOne({
        where: { affiliateCode: code, tenantId },
      });
      exists = !!existing;
      attempts++;
    }

    if (exists) {
      throw new Error('Failed to generate unique affiliate code');
    }

    return code!;
  }

  /**
   * Ensure code is unique, modify if necessary
   */
  private async ensureUniqueCode(
    preferredCode: string,
    tenantId: string,
  ): Promise<string> {
    let code = preferredCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let suffix = 1;

    while (true) {
      const existing = await this.affiliateRepository.findOne({
        where: { affiliateCode: code, tenantId },
      });

      if (!existing) {
        return code;
      }

      code = `${preferredCode}${suffix}`;
      suffix++;

      if (suffix > 100) {
        throw new Error('Failed to generate unique affiliate code');
      }
    }
  }

  /**
   * Generate random code (6 characters)
   */
  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Delete affiliate
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const affiliate = await this.findOne(id, tenantId);
    await this.affiliateRepository.softRemove(affiliate);
    this.logger.log(`Deleted affiliate ${affiliate.affiliateCode}`);
  }
}
