import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Payout, PayoutStatus, PayoutMethod } from '../payout.entity';
import { Affiliate } from '../affiliate.entity';
import { Commission, CommissionStatus } from '../commission.entity';
import { CommissionService } from './commission.service';
import {
  CreatePayoutDto,
  UpdatePayoutDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  BatchPayoutDto,
  PayoutQueryDto,
} from '../dto/payout.dto';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    private readonly commissionService: CommissionService,
  ) {}

  /**
   * Create a payout
   */
  async create(
    createPayoutDto: CreatePayoutDto,
    tenantId: string,
  ): Promise<Payout> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: createPayoutDto.affiliateId, tenantId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    // Validate payout amount
    if (createPayoutDto.amount <= 0) {
      throw new BadRequestException('Payout amount must be greater than 0');
    }

    if (createPayoutDto.amount > affiliate.pendingBalance) {
      throw new BadRequestException(
        'Payout amount exceeds pending balance',
      );
    }

    const payout = this.payoutRepository.create({
      ...createPayoutDto,
      tenantId,
      status: PayoutStatus.PENDING,
    });

    const saved = await this.payoutRepository.save(payout);

    this.logger.log(
      `Created payout ${saved.id} for affiliate ${affiliate.affiliateCode}, amount: ${saved.amount}`,
    );

    return saved;
  }

  /**
   * Request payout (by affiliate)
   */
  async requestPayout(
    affiliateId: string,
    requestDto: RequestPayoutDto,
    tenantId: string,
  ): Promise<Payout> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: affiliateId, tenantId },
      relations: ['commissionPlan'],
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    // Check minimum payout amount
    const minimumPayout =
      affiliate.commissionPlan?.minimumPayout || 50;

    if (affiliate.pendingBalance < minimumPayout) {
      throw new BadRequestException(
        `Minimum payout amount is ${minimumPayout}`,
      );
    }

    // Get payable commissions
    const payableCommissions = await this.commissionService.getPayableCommissions(
      affiliateId,
      tenantId,
    );

    if (payableCommissions.length === 0) {
      throw new BadRequestException('No payable commissions available');
    }

    const amount = payableCommissions.reduce(
      (sum, commission) => sum + commission.amount,
      0,
    );

    // Get payment method
    const method =
      requestDto.method ||
      (affiliate.paymentInfo?.method as PayoutMethod) ||
      PayoutMethod.MANUAL;

    const payout = await this.create(
      {
        affiliateId,
        amount,
        method,
        paymentDetails: {
          ...affiliate.paymentInfo,
          ...requestDto.paymentDetails,
        },
        commissionIds: payableCommissions.map((c) => c.id),
        commissionCount: payableCommissions.length,
        notes: requestDto.notes,
      },
      tenantId,
    );

    this.logger.log(
      `Affiliate ${affiliate.affiliateCode} requested payout of ${amount}`,
    );

    return payout;
  }

  /**
   * Find all payouts with filters
   */
  async findAll(
    queryDto: PayoutQueryDto,
    tenantId: string,
  ): Promise<{ data: Payout[]; total: number; page: number; limit: number }> {
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

    if (queryDto.method) {
      where.method = queryDto.method;
    }

    if (queryDto.startDate && queryDto.endDate) {
      where.createdAt = Between(
        new Date(queryDto.startDate),
        new Date(queryDto.endDate),
      );
    }

    const [data, total] = await this.payoutRepository.findAndCount({
      where,
      relations: ['affiliate', 'affiliate.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  /**
   * Find one payout by ID
   */
  async findOne(id: string, tenantId: string): Promise<Payout> {
    const payout = await this.payoutRepository.findOne({
      where: { id, tenantId },
      relations: ['affiliate', 'affiliate.user'],
    });

    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }

    return payout;
  }

  /**
   * Update payout
   */
  async update(
    id: string,
    updatePayoutDto: UpdatePayoutDto,
    tenantId: string,
  ): Promise<Payout> {
    const payout = await this.findOne(id, tenantId);

    Object.assign(payout, updatePayoutDto);

    return this.payoutRepository.save(payout);
  }

  /**
   * Process payout (mark as completed)
   */
  async processPayout(
    processDto: ProcessPayoutDto,
    tenantId: string,
  ): Promise<Payout> {
    const payout = await this.findOne(processDto.payoutId, tenantId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be processed');
    }

    payout.status = PayoutStatus.COMPLETED;
    payout.processedAt = new Date();

    if (processDto.transactionId) {
      payout.paymentDetails = {
        ...payout.paymentDetails,
        transactionId: processDto.transactionId,
      };
    }

    if (processDto.paymentDetails) {
      payout.paymentDetails = {
        ...payout.paymentDetails,
        ...processDto.paymentDetails,
      };
    }

    const saved = await this.payoutRepository.save(payout);

    // Mark all commissions as paid
    if (payout.commissionIds && payout.commissionIds.length > 0) {
      for (const commissionId of payout.commissionIds) {
        await this.commissionService.markPaid(commissionId, tenantId, payout.id);
      }
    }

    this.logger.log(`Processed payout ${payout.id}`);

    return saved;
  }

  /**
   * Fail payout
   */
  async failPayout(
    id: string,
    tenantId: string,
    reason: string,
  ): Promise<Payout> {
    const payout = await this.findOne(id, tenantId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be failed');
    }

    payout.status = PayoutStatus.FAILED;
    payout.failureReason = reason;

    const saved = await this.payoutRepository.save(payout);

    this.logger.log(`Failed payout ${payout.id}: ${reason}`);

    return saved;
  }

  /**
   * Cancel payout
   */
  async cancelPayout(id: string, tenantId: string): Promise<Payout> {
    const payout = await this.findOne(id, tenantId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be cancelled');
    }

    payout.status = PayoutStatus.CANCELLED;

    const saved = await this.payoutRepository.save(payout);

    this.logger.log(`Cancelled payout ${payout.id}`);

    return saved;
  }

  /**
   * Process batch payouts
   */
  async processBatchPayouts(
    batchDto: BatchPayoutDto,
    tenantId: string,
  ): Promise<Payout[]> {
    const payouts: Payout[] = [];
    const minimumBalance = batchDto.minimumBalance || 0;

    for (const affiliateId of batchDto.affiliateIds) {
      const affiliate = await this.affiliateRepository.findOne({
        where: { id: affiliateId, tenantId },
      });

      if (!affiliate) {
        this.logger.warn(`Affiliate ${affiliateId} not found, skipping`);
        continue;
      }

      if (affiliate.pendingBalance < minimumBalance) {
        this.logger.debug(
          `Affiliate ${affiliate.affiliateCode} balance ${affiliate.pendingBalance} below minimum ${minimumBalance}, skipping`,
        );
        continue;
      }

      // Get payable commissions
      const payableCommissions = await this.commissionService.getPayableCommissions(
        affiliateId,
        tenantId,
      );

      if (payableCommissions.length === 0) {
        this.logger.debug(
          `No payable commissions for affiliate ${affiliate.affiliateCode}, skipping`,
        );
        continue;
      }

      const amount = payableCommissions.reduce(
        (sum, commission) => sum + commission.amount,
        0,
      );

      const payout = await this.create(
        {
          affiliateId,
          amount,
          method: batchDto.method,
          paymentDetails: affiliate.paymentInfo || {},
          commissionIds: payableCommissions.map((c) => c.id),
          commissionCount: payableCommissions.length,
          notes: batchDto.notes,
        },
        tenantId,
      );

      payouts.push(payout);
    }

    this.logger.log(
      `Created ${payouts.length} payouts in batch for ${batchDto.affiliateIds.length} affiliates`,
    );

    return payouts;
  }

  /**
   * Get payout statistics
   */
  async getStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalPayouts: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
    failedAmount: number;
  }> {
    const queryBuilder = this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.tenantId = :tenantId', { tenantId });

    if (startDate) {
      queryBuilder.andWhere('payout.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('payout.createdAt <= :endDate', { endDate });
    }

    const totalPayouts = await queryBuilder.getCount();

    const totalAmount = await queryBuilder
      .select('SUM(payout.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const pendingAmount = await queryBuilder
      .andWhere('payout.status = :status', { status: PayoutStatus.PENDING })
      .select('SUM(payout.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const completedAmount = await this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.tenantId = :tenantId', { tenantId })
      .andWhere('payout.status = :status', { status: PayoutStatus.COMPLETED })
      .select('SUM(payout.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const failedAmount = await this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.tenantId = :tenantId', { tenantId })
      .andWhere('payout.status = :status', { status: PayoutStatus.FAILED })
      .select('SUM(payout.amount)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    return {
      totalPayouts,
      totalAmount,
      pendingAmount,
      completedAmount,
      failedAmount,
    };
  }
}
