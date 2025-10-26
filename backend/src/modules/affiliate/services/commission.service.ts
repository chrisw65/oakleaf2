import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Commission, CommissionStatus } from '../commission.entity';
import { Affiliate } from '../affiliate.entity';
import { CommissionPlan } from '../commission-plan.entity';
import { AffiliateTrackingService } from './affiliate-tracking.service';
import {
  CreateCommissionDto,
  UpdateCommissionDto,
  CommissionQueryDto,
} from '../dto/commission.dto';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(CommissionPlan)
    private readonly commissionPlanRepository: Repository<CommissionPlan>,
    private readonly trackingService: AffiliateTrackingService,
  ) {}

  /**
   * Create a commission (typically after a purchase)
   */
  async create(
    createCommissionDto: CreateCommissionDto,
    tenantId: string,
  ): Promise<Commission> {
    const commission = this.commissionRepository.create({
      ...createCommissionDto,
      tenantId,
      status: CommissionStatus.PENDING,
    });

    // Calculate payable date based on commission hold period
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: createCommissionDto.affiliateId, tenantId },
      relations: ['commissionPlan'],
    });

    if (affiliate?.commissionPlan?.commissionHoldDays) {
      const payableAt = new Date();
      payableAt.setDate(
        payableAt.getDate() + affiliate.commissionPlan.commissionHoldDays,
      );
      commission.payableAt = payableAt;
    }

    const saved = await this.commissionRepository.save(commission);

    // Update affiliate total earnings
    await this.affiliateRepository.increment(
      { id: createCommissionDto.affiliateId },
      'totalEarnings',
      createCommissionDto.amount,
    );
    await this.affiliateRepository.increment(
      { id: createCommissionDto.affiliateId },
      'pendingBalance',
      createCommissionDto.amount,
    );

    this.logger.log(
      `Created commission ${saved.id} for affiliate ${createCommissionDto.affiliateId}, amount: ${createCommissionDto.amount}`,
    );

    return saved;
  }

  /**
   * Create multi-tier commissions for an order
   */
  async createMultiTierCommissions(
    orderId: string,
    orderAmount: number,
    affiliateId: string,
    tenantId: string,
    productId?: string,
  ): Promise<Commission[]> {
    const commissions: Commission[] = [];

    // Get affiliate chain (current affiliate + parent affiliates)
    const affiliateChain = await this.trackingService.getAffiliateChain(
      affiliateId,
      tenantId,
    );

    for (const { affiliateId: chainAffiliateId, tier } of affiliateChain) {
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: chainAffiliateId, tenantId },
        relations: ['commissionPlan'],
      });

      if (!affiliate || !affiliate.commissionPlan) {
        continue;
      }

      const plan = affiliate.commissionPlan;

      // Get tier rate
      let rate = 0;
      if (tier === 1) {
        rate = plan.tier1Rate || 0;
      } else if (tier === 2) {
        rate = plan.tier2Rate || 0;
      } else if (tier === 3) {
        rate = plan.tier3Rate || 0;
      }

      if (rate === 0) {
        continue;
      }

      // Calculate commission amount
      const amount = (orderAmount * rate) / 100;

      const commission = await this.create(
        {
          affiliateId: chainAffiliateId,
          orderId,
          amount,
          tier,
          rate,
          orderAmount,
          productId,
          commissionPlanId: plan.id,
        },
        tenantId,
      );

      commissions.push(commission);
    }

    this.logger.log(
      `Created ${commissions.length} multi-tier commissions for order ${orderId}`,
    );

    return commissions;
  }

  /**
   * Find all commissions with filters
   */
  async findAll(
    queryDto: CommissionQueryDto,
    tenantId: string,
  ): Promise<{ data: Commission[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (queryDto.affiliateId) {
      where.affiliateId = queryDto.affiliateId;
    }

    if (queryDto.status) {
      where.status = queryDto.status;
    }

    if (queryDto.tier) {
      where.tier = queryDto.tier;
    }

    if (queryDto.startDate && queryDto.endDate) {
      where.createdAt = Between(
        new Date(queryDto.startDate),
        new Date(queryDto.endDate),
      );
    }

    const [data, total] = await this.commissionRepository.findAndCount({
      where,
      relations: ['affiliate', 'affiliate.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  /**
   * Find one commission by ID
   */
  async findOne(id: string, tenantId: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({
      where: { id, tenantId },
      relations: ['affiliate', 'affiliate.user'],
    });

    if (!commission) {
      throw new NotFoundException(`Commission with ID ${id} not found`);
    }

    return commission;
  }

  /**
   * Update commission
   */
  async update(
    id: string,
    updateCommissionDto: UpdateCommissionDto,
    tenantId: string,
  ): Promise<Commission> {
    const commission = await this.findOne(id, tenantId);

    Object.assign(commission, updateCommissionDto);

    return this.commissionRepository.save(commission);
  }

  /**
   * Approve commission
   */
  async approve(id: string, tenantId: string, notes?: string): Promise<Commission> {
    const commission = await this.findOne(id, tenantId);

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending commissions can be approved',
      );
    }

    commission.status = CommissionStatus.APPROVED;
    if (notes) {
      commission.notes = notes;
    }

    const saved = await this.commissionRepository.save(commission);

    this.logger.log(`Approved commission ${id}`);

    return saved;
  }

  /**
   * Reject commission
   */
  async reject(
    id: string,
    tenantId: string,
    reason: string,
  ): Promise<Commission> {
    const commission = await this.findOne(id, tenantId);

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending commissions can be rejected',
      );
    }

    commission.status = CommissionStatus.REJECTED;
    commission.notes = reason;

    // Deduct from affiliate earnings
    await this.affiliateRepository.decrement(
      { id: commission.affiliateId },
      'totalEarnings',
      commission.amount,
    );
    await this.affiliateRepository.decrement(
      { id: commission.affiliateId },
      'pendingBalance',
      commission.amount,
    );

    const saved = await this.commissionRepository.save(commission);

    this.logger.log(`Rejected commission ${id}: ${reason}`);

    return saved;
  }

  /**
   * Mark commission as paid
   */
  async markPaid(
    id: string,
    tenantId: string,
    payoutId: string,
  ): Promise<Commission> {
    const commission = await this.findOne(id, tenantId);

    if (commission.status !== CommissionStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved commissions can be marked as paid',
      );
    }

    commission.status = CommissionStatus.PAID;
    commission.payoutId = payoutId;
    commission.paidAt = new Date();

    // Update affiliate balances
    await this.affiliateRepository.decrement(
      { id: commission.affiliateId },
      'pendingBalance',
      commission.amount,
    );
    await this.affiliateRepository.increment(
      { id: commission.affiliateId },
      'totalPaid',
      commission.amount,
    );

    const saved = await this.commissionRepository.save(commission);

    this.logger.log(`Marked commission ${id} as paid in payout ${payoutId}`);

    return saved;
  }

  /**
   * Get pending commissions for an affiliate
   */
  async getPendingCommissions(
    affiliateId: string,
    tenantId: string,
  ): Promise<Commission[]> {
    return this.commissionRepository.find({
      where: {
        tenantId,
        affiliateId,
        status: In([CommissionStatus.PENDING, CommissionStatus.APPROVED]),
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get payable commissions (approved and past hold period)
   */
  async getPayableCommissions(
    affiliateId: string,
    tenantId: string,
  ): Promise<Commission[]> {
    const now = new Date();

    return this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.tenantId = :tenantId', { tenantId })
      .andWhere('commission.affiliateId = :affiliateId', { affiliateId })
      .andWhere('commission.status = :status', {
        status: CommissionStatus.APPROVED,
      })
      .andWhere('(commission.payableAt IS NULL OR commission.payableAt <= :now)', {
        now,
      })
      .orderBy('commission.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Get commission statistics for an affiliate
   */
  async getStats(
    affiliateId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalCommissions: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
    rejectedAmount: number;
  }> {
    const queryBuilder = this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.tenantId = :tenantId', { tenantId })
      .andWhere('commission.affiliateId = :affiliateId', { affiliateId });

    if (startDate) {
      queryBuilder.andWhere('commission.createdAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('commission.createdAt <= :endDate', { endDate });
    }

    const totalCommissions = await queryBuilder.getCount();

    const totalAmount = await queryBuilder
      .select('SUM(commission.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const pendingAmount = await queryBuilder
      .andWhere('commission.status = :status', {
        status: CommissionStatus.PENDING,
      })
      .select('SUM(commission.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const approvedAmount = await this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.tenantId = :tenantId', { tenantId })
      .andWhere('commission.affiliateId = :affiliateId', { affiliateId })
      .andWhere('commission.status = :status', {
        status: CommissionStatus.APPROVED,
      })
      .select('SUM(commission.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const paidAmount = await this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.tenantId = :tenantId', { tenantId })
      .andWhere('commission.affiliateId = :affiliateId', { affiliateId })
      .andWhere('commission.status = :status', {
        status: CommissionStatus.PAID,
      })
      .select('SUM(commission.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const rejectedAmount = await this.commissionRepository
      .createQueryBuilder('commission')
      .where('commission.tenantId = :tenantId', { tenantId })
      .andWhere('commission.affiliateId = :affiliateId', { affiliateId })
      .andWhere('commission.status = :status', {
        status: CommissionStatus.REJECTED,
      })
      .select('SUM(commission.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    return {
      totalCommissions,
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      rejectedAmount,
    };
  }
}
