import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateClick } from '../affiliate-click.entity';
import { Affiliate } from '../affiliate.entity';
import { Commission } from '../commission.entity';
import { CommissionPlan } from '../commission-plan.entity';
import { TrackClickDto } from '../dto/affiliate.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AffiliateTrackingService {
  private readonly logger = new Logger(AffiliateTrackingService.name);

  constructor(
    @InjectRepository(AffiliateClick)
    private readonly clickRepository: Repository<AffiliateClick>,
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(CommissionPlan)
    private readonly commissionPlanRepository: Repository<CommissionPlan>,
  ) {}

  /**
   * Track an affiliate click
   */
  async trackClick(
    trackClickDto: TrackClickDto,
    tenantId: string,
  ): Promise<{ clickId: string; visitorId: string; cookieExpiry: Date }> {
    // Find affiliate by code
    const affiliate = await this.affiliateRepository.findOne({
      where: {
        tenantId,
        affiliateCode: trackClickDto.affiliateCode,
      },
      relations: ['commissionPlan'],
    });

    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Generate or use existing visitor ID
    const visitorId = trackClickDto.visitorId || uuidv4();

    // Get cookie duration from commission plan
    const cookieDurationDays =
      affiliate.commissionPlan?.cookieDurationDays || 30;
    const cookieExpiry = new Date();
    cookieExpiry.setDate(cookieExpiry.getDate() + cookieDurationDays);

    // Parse device and location info from user agent
    const deviceInfo = this.parseUserAgent(trackClickDto.userAgent);

    // Create click record
    const click = this.clickRepository.create({
      tenantId,
      affiliateId: affiliate.id,
      visitorId,
      ipAddress: trackClickDto.ipAddress,
      userAgent: trackClickDto.userAgent,
      referrer: trackClickDto.referrer,
      landingPage: trackClickDto.landingPage,
      utmParams: trackClickDto.utmParams || {},
      deviceType: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      converted: false,
    });

    const savedClick = await this.clickRepository.save(click);

    // Update affiliate click count
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalClicks',
      1,
    );

    this.logger.log(
      `Tracked click for affiliate ${affiliate.affiliateCode}, visitor ${visitorId}`,
    );

    return {
      clickId: savedClick.id,
      visitorId,
      cookieExpiry,
    };
  }

  /**
   * Get affiliate attribution for a visitor
   */
  async getAttribution(
    visitorId: string,
    tenantId: string,
  ): Promise<{ affiliateId: string; clickId: string; tier: number } | null> {
    // Find the most recent click for this visitor
    const click = await this.clickRepository.findOne({
      where: {
        tenantId,
        visitorId,
        converted: false,
      },
      order: { createdAt: 'DESC' },
      relations: ['affiliate', 'affiliate.commissionPlan'],
    });

    if (!click) {
      return null;
    }

    // Check if click is still within cookie duration
    const affiliate = click.affiliate as any;
    const cookieDurationDays =
      affiliate?.commissionPlan?.cookieDurationDays || 30;
    const expiryDate = new Date(click.createdAt);
    expiryDate.setDate(expiryDate.getDate() + cookieDurationDays);

    if (new Date() > expiryDate) {
      this.logger.debug(
        `Click ${click.id} has expired (${cookieDurationDays} days)`,
      );
      return null;
    }

    return {
      affiliateId: click.affiliateId,
      clickId: click.id,
      tier: 1, // Direct referral
    };
  }

  /**
   * Mark a click as converted
   */
  async markConverted(clickId: string, tenantId: string): Promise<void> {
    await this.clickRepository.update(
      { id: clickId, tenantId },
      {
        converted: true,
        convertedAt: new Date(),
      },
    );

    // Update affiliate conversion count
    const click = await this.clickRepository.findOne({
      where: { id: clickId, tenantId },
    });

    if (click) {
      await this.affiliateRepository.increment(
        { id: click.affiliateId },
        'totalConversions',
        1,
      );

      // Update conversion rate
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: click.affiliateId },
      });

      if (affiliate && affiliate.totalClicks > 0) {
        const conversionRate =
          (affiliate.totalConversions / affiliate.totalClicks) * 100;
        await this.affiliateRepository.update(
          { id: affiliate.id },
          { conversionRate: parseFloat(conversionRate.toFixed(2)) },
        );
      }
    }
  }

  /**
   * Get affiliate chain (for multi-tier commissions)
   */
  async getAffiliateChain(
    affiliateId: string,
    tenantId: string,
  ): Promise<Array<{ affiliateId: string; tier: number }>> {
    const chain: Array<{ affiliateId: string; tier: number }> = [];
    let currentAffiliateId: string | undefined = affiliateId;
    let tier = 1;

    while (currentAffiliateId && tier <= 3) {
      chain.push({ affiliateId: currentAffiliateId, tier });

      const affiliate = await this.affiliateRepository.findOne({
        where: { id: currentAffiliateId, tenantId },
      });

      if (!affiliate || !affiliate.parentAffiliateId) {
        break;
      }

      currentAffiliateId = affiliate.parentAffiliateId;
      tier++;
    }

    return chain;
  }

  /**
   * Get click statistics for an affiliate
   */
  async getClickStats(
    affiliateId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    uniqueVisitors: number;
  }> {
    const queryBuilder = this.clickRepository
      .createQueryBuilder('click')
      .where('click.tenantId = :tenantId', { tenantId })
      .andWhere('click.affiliateId = :affiliateId', { affiliateId });

    if (startDate) {
      queryBuilder.andWhere('click.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('click.createdAt <= :endDate', { endDate });
    }

    const totalClicks = await queryBuilder.getCount();

    const totalConversions = await queryBuilder
      .andWhere('click.converted = :converted', { converted: true })
      .getCount();

    const uniqueVisitors = await this.clickRepository
      .createQueryBuilder('click')
      .select('COUNT(DISTINCT click.visitorId)', 'count')
      .where('click.tenantId = :tenantId', { tenantId })
      .andWhere('click.affiliateId = :affiliateId', { affiliateId })
      .getRawOne()
      .then((result) => parseInt(result.count, 10));

    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      totalClicks,
      totalConversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      uniqueVisitors,
    };
  }

  /**
   * Parse user agent string to extract device info
   */
  private parseUserAgent(userAgent?: string): {
    device: string;
    browser: string;
    os: string;
  } {
    if (!userAgent) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }

    // Simple parsing (in production, use a library like ua-parser-js)
    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect device
    if (/mobile/i.test(userAgent)) {
      device = 'Mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = 'Tablet';
    }

    // Detect browser
    if (/chrome/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/safari/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/edge/i.test(userAgent)) {
      browser = 'Edge';
    }

    // Detect OS
    if (/windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/mac/i.test(userAgent)) {
      os = 'macOS';
    } else if (/linux/i.test(userAgent)) {
      os = 'Linux';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/ios|iphone|ipad/i.test(userAgent)) {
      os = 'iOS';
    }

    return { device, browser, os };
  }
}
