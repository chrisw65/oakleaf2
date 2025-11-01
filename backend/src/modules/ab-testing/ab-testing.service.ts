import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ABTest, TestStatus, TestType, WinnerSelectionMethod } from './ab-test.entity';
import { ABTestParticipant } from './ab-test-participant.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import * as crypto from 'crypto';

export interface CreateABTestDto {
  name: string;
  description?: string;
  type: TestType;
  resourceType?: string;
  resourceId?: string;
  variants: Array<{
    name: string;
    description?: string;
    weight: number;
    isControl: boolean;
    config?: Record<string, any>;
  }>;
  trafficAllocation?: number;
  goalMetric: string;
  targetImprovement?: number;
  confidenceLevel?: number;
  minSampleSize?: number;
  maxDuration?: number;
  winnerSelectionMethod?: WinnerSelectionMethod;
}

export interface UpdateABTestDto {
  name?: string;
  description?: string;
  trafficAllocation?: number;
  minSampleSize?: number;
  maxDuration?: number;
}

export interface AssignVariantDto {
  userId?: string;
  sessionId: string;
  deviceType?: string;
  browser?: string;
  country?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

export interface TrackConversionDto {
  value?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name);

  constructor(
    @InjectRepository(ABTest)
    private readonly abTestRepository: Repository<ABTest>,
    @InjectRepository(ABTestParticipant)
    private readonly participantRepository: Repository<ABTestParticipant>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create new A/B test
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateABTestDto,
  ): Promise<ABTest> {
    // Validate variant weights
    const totalWeight = dto.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new BadRequestException('Variant weights must sum to 100');
    }

    // Ensure there's exactly one control variant
    const controlCount = dto.variants.filter((v) => v.isControl).length;
    if (controlCount !== 1) {
      throw new BadRequestException('Exactly one variant must be marked as control');
    }

    // Add IDs to variants
    const variants = dto.variants.map((v) => ({
      ...v,
      id: this.generateVariantId(),
    }));

    const abTest = this.abTestRepository.create({
      tenantId,
      ...dto,
      variants,
      trafficAllocation: dto.trafficAllocation || 100,
      confidenceLevel: dto.confidenceLevel || 95,
      winnerSelectionMethod: dto.winnerSelectionMethod || WinnerSelectionMethod.MANUAL,
      createdBy: userId,
      status: TestStatus.DRAFT,
    });

    await this.abTestRepository.save(abTest);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'ab_test',
      resourceId: abTest.id,
      description: `Created A/B test: ${dto.name}`,
      metadata: { type: dto.type, variantsCount: variants.length },
    });

    this.logger.log(`A/B test created: ${abTest.id} (${dto.name})`);

    return abTest;
  }

  /**
   * Start A/B test
   */
  async start(tenantId: string, userId: string, testId: string): Promise<ABTest> {
    const test = await this.findOne(tenantId, testId);

    if (test.status !== TestStatus.DRAFT && test.status !== TestStatus.PAUSED) {
      throw new BadRequestException('Test can only be started from draft or paused status');
    }

    test.status = TestStatus.RUNNING;
    if (!test.startedAt) {
      test.startedAt = new Date();
    }

    await this.abTestRepository.save(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Started A/B test: ${test.name}`,
    });

    this.logger.log(`A/B test started: ${test.id}`);

    return test;
  }

  /**
   * Pause A/B test
   */
  async pause(tenantId: string, userId: string, testId: string): Promise<ABTest> {
    const test = await this.findOne(tenantId, testId);

    if (test.status !== TestStatus.RUNNING) {
      throw new BadRequestException('Only running tests can be paused');
    }

    test.status = TestStatus.PAUSED;
    await this.abTestRepository.save(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Paused A/B test: ${test.name}`,
    });

    this.logger.log(`A/B test paused: ${test.id}`);

    return test;
  }

  /**
   * Complete A/B test
   */
  async complete(tenantId: string, userId: string, testId: string): Promise<ABTest> {
    const test = await this.findOne(tenantId, testId);

    if (test.status === TestStatus.COMPLETED) {
      throw new BadRequestException('Test is already completed');
    }

    test.status = TestStatus.COMPLETED;
    test.endedAt = new Date();

    // Calculate final results
    test.results = await this.calculateResults(tenantId, testId);

    // Auto-select winner if method is not manual
    if (test.winnerSelectionMethod !== WinnerSelectionMethod.MANUAL && !test.winnerId) {
      await this.selectWinner(tenantId, userId, testId, test.winnerSelectionMethod);
    }

    await this.abTestRepository.save(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Completed A/B test: ${test.name}`,
      metadata: { duration: test.getDuration() },
    });

    this.logger.log(`A/B test completed: ${test.id}`);

    return test;
  }

  /**
   * Assign user to a variant
   */
  async assignVariant(
    tenantId: string,
    testId: string,
    dto: AssignVariantDto,
  ): Promise<{ variantId: string; config?: Record<string, any> }> {
    const test = await this.findOne(tenantId, testId);

    if (!test.isRunning()) {
      throw new BadRequestException('Test is not running');
    }

    // Check if user already assigned
    const existingParticipant = await this.participantRepository.findOne({
      where: {
        tenantId,
        testId,
        sessionId: dto.sessionId,
      },
    });

    if (existingParticipant) {
      const variant = test.getVariant(existingParticipant.variantId);
      return {
        variantId: existingParticipant.variantId,
        config: variant?.config,
      };
    }

    // Check traffic allocation
    const shouldInclude = Math.random() * 100 < test.trafficAllocation;
    if (!shouldInclude) {
      // Return control variant but don't track
      const control = test.getControlVariant();
      return {
        variantId: control!.id,
        config: control?.config,
      };
    }

    // Select variant based on weights
    const variantId = this.selectVariantByWeight(test.variants);
    const variant = test.getVariant(variantId);

    // Create participant record
    const participant = this.participantRepository.create({
      tenantId,
      testId,
      variantId,
      userId: dto.userId,
      sessionId: dto.sessionId,
      assignedAt: new Date(),
      deviceType: dto.deviceType,
      browser: dto.browser,
      country: dto.country,
      referrer: dto.referrer,
      metadata: dto.metadata,
    });

    await this.participantRepository.save(participant);

    this.logger.debug(`User assigned to variant ${variantId} in test ${testId}`);

    return {
      variantId,
      config: variant?.config,
    };
  }

  /**
   * Track conversion
   */
  async trackConversion(
    tenantId: string,
    testId: string,
    sessionId: string,
    dto: TrackConversionDto,
  ): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: {
        tenantId,
        testId,
        sessionId,
      },
    });

    if (!participant) {
      this.logger.warn(`Participant not found for session ${sessionId} in test ${testId}`);
      return;
    }

    if (participant.converted) {
      this.logger.debug(`Participant already converted in test ${testId}`);
      return;
    }

    participant.markAsConverted(dto.value);
    if (dto.metadata) {
      participant.metadata = { ...participant.metadata, ...dto.metadata };
    }

    await this.participantRepository.save(participant);

    this.logger.debug(`Conversion tracked for test ${testId}, variant ${participant.variantId}`);
  }

  /**
   * Track event for participant
   */
  async trackEvent(
    tenantId: string,
    testId: string,
    sessionId: string,
    eventType: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: {
        tenantId,
        testId,
        sessionId,
      },
    });

    if (!participant) {
      return;
    }

    participant.addEvent(eventType, data);
    await this.participantRepository.save(participant);
  }

  /**
   * Calculate test results
   */
  async calculateResults(tenantId: string, testId: string): Promise<any[]> {
    const test = await this.findOne(tenantId, testId);

    const results = [];

    for (const variant of test.variants) {
      const participants = await this.participantRepository.find({
        where: {
          tenantId,
          testId,
          variantId: variant.id,
        },
      });

      const totalParticipants = participants.length;
      const conversions = participants.filter((p) => p.converted).length;
      const conversionRate = totalParticipants > 0 ? (conversions / totalParticipants) * 100 : 0;

      const revenue = participants.reduce(
        (sum, p) => sum + Number(p.conversionValue || 0),
        0,
      );

      const averageOrderValue =
        conversions > 0 ? revenue / conversions : 0;

      const engagement = participants.reduce((sum, p) => sum + p.interactions, 0) / (totalParticipants || 1);

      results.push({
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        participants: totalParticipants,
        conversions,
        conversionRate: Number(conversionRate.toFixed(2)),
        revenue: Number(revenue.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        engagement: Number(engagement.toFixed(2)),
      });
    }

    // Calculate statistical significance
    const control = results.find((r) => r.isControl);
    if (control) {
      for (const result of results) {
        if (!result.isControl) {
          result.confidence = this.calculateConfidence(
            control.participants,
            control.conversions,
            result.participants,
            result.conversions,
          );
          result.improvement = control.conversionRate > 0
            ? ((result.conversionRate - control.conversionRate) / control.conversionRate) * 100
            : 0;
        }
      }
    }

    return results;
  }

  /**
   * Select winner
   */
  async selectWinner(
    tenantId: string,
    userId: string,
    testId: string,
    method: WinnerSelectionMethod,
  ): Promise<ABTest> {
    const test = await this.findOne(tenantId, testId);

    const results = test.results || (await this.calculateResults(tenantId, testId));

    let winner;

    switch (method) {
      case WinnerSelectionMethod.CONVERSIONS:
        winner = results.reduce((max, r) =>
          r.conversionRate > max.conversionRate ? r : max,
        );
        break;

      case WinnerSelectionMethod.REVENUE:
        winner = results.reduce((max, r) => (r.revenue > max.revenue ? r : max));
        break;

      case WinnerSelectionMethod.ENGAGEMENT:
        winner = results.reduce((max, r) => (r.engagement > max.engagement ? r : max));
        break;

      default:
        throw new BadRequestException('Invalid winner selection method');
    }

    test.winnerId = winner.variantId;
    test.winnerSelectedAt = new Date();
    test.results = results.map((r) => ({
      ...r,
      isWinner: r.variantId === winner.variantId,
    }));

    await this.abTestRepository.save(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Winner selected for A/B test: ${test.name}`,
      metadata: { winnerId: winner.variantId, method },
    });

    this.logger.log(`Winner selected for test ${test.id}: ${winner.variantId}`);

    return test;
  }

  /**
   * Update A/B test
   */
  async update(
    tenantId: string,
    userId: string,
    testId: string,
    dto: UpdateABTestDto,
  ): Promise<ABTest> {
    const test = await this.findOne(tenantId, testId);

    if (test.status === TestStatus.RUNNING) {
      throw new BadRequestException('Cannot update running test');
    }

    Object.assign(test, dto);
    await this.abTestRepository.save(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Updated A/B test: ${test.name}`,
    });

    return test;
  }

  /**
   * Delete A/B test
   */
  async delete(tenantId: string, userId: string, testId: string): Promise<void> {
    const test = await this.findOne(tenantId, testId);

    if (test.status === TestStatus.RUNNING) {
      throw new BadRequestException('Cannot delete running test');
    }

    // Delete participants
    await this.participantRepository.delete({ tenantId, testId });

    await this.abTestRepository.remove(test);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource: 'ab_test',
      resourceId: test.id,
      description: `Deleted A/B test: ${test.name}`,
    });

    this.logger.log(`A/B test deleted: ${test.id}`);
  }

  /**
   * Find one A/B test
   */
  async findOne(tenantId: string, testId: string): Promise<ABTest> {
    const test = await this.abTestRepository.findOne({
      where: { tenantId, id: testId },
    });

    if (!test) {
      throw new NotFoundException('A/B test not found');
    }

    return test;
  }

  /**
   * Find all A/B tests
   */
  async findAll(tenantId: string, status?: TestStatus): Promise<ABTest[]> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return await this.abTestRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get test statistics
   */
  async getStatistics(tenantId: string, testId: string): Promise<any> {
    const test = await this.findOne(tenantId, testId);
    const results = await this.calculateResults(tenantId, testId);

    const totalParticipants = results.reduce((sum, r) => sum + r.participants, 0);
    const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);
    const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);

    return {
      test: {
        id: test.id,
        name: test.name,
        status: test.status,
        startedAt: test.startedAt,
        duration: test.getDuration(),
      },
      summary: {
        totalParticipants,
        totalConversions,
        totalRevenue: totalRevenue.toFixed(2),
        overallConversionRate:
          totalParticipants > 0
            ? ((totalConversions / totalParticipants) * 100).toFixed(2)
            : 0,
      },
      variants: results,
      hasWinner: test.hasWinner(),
      winnerId: test.winnerId,
      hasStatisticalSignificance: test.hasStatisticalSignificance(),
    };
  }

  /**
   * Helper: Select variant by weight
   */
  private selectVariantByWeight(variants: any[]): string {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    return variants[0].id;
  }

  /**
   * Helper: Generate variant ID
   */
  private generateVariantId(): string {
    return `var_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Helper: Calculate statistical confidence using Z-test
   */
  private calculateConfidence(
    n1: number,
    x1: number,
    n2: number,
    x2: number,
  ): number {
    if (n1 === 0 || n2 === 0) {
      return 0;
    }

    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const p = (x1 + x2) / (n1 + n2);

    const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));

    if (se === 0) {
      return 0;
    }

    const z = Math.abs((p1 - p2) / se);

    // Convert Z-score to confidence level (approximation)
    const confidence = this.zScoreToConfidence(z);

    return Number(confidence.toFixed(2));
  }

  /**
   * Helper: Convert Z-score to confidence percentage
   */
  private zScoreToConfidence(z: number): number {
    // Approximation using error function
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return (1 - p) * 100;
  }
}
