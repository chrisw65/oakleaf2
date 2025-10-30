import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunnelVariant, VariantStatus } from '../funnel-variant.entity';
import { Funnel } from '../funnel.entity';
import {
  CreateFunnelVariantDto,
  UpdateFunnelVariantDto,
  DeclareWinnerDto,
} from '../dto/funnel-variant.dto';

@Injectable()
export class FunnelVariantService {
  private readonly logger = new Logger(FunnelVariantService.name);

  constructor(
    @InjectRepository(FunnelVariant)
    private readonly variantRepository: Repository<FunnelVariant>,
    @InjectRepository(Funnel)
    private readonly funnelRepository: Repository<Funnel>,
  ) {}

  /**
   * Create a new funnel variant
   */
  async create(
    funnelId: string,
    createDto: CreateFunnelVariantDto,
    tenantId: string,
  ): Promise<FunnelVariant> {
    // Verify funnel exists
    const funnel = await this.funnelRepository.findOne({
      where: { id: funnelId, tenantId },
    });

    if (!funnel) {
      throw new NotFoundException('Funnel not found');
    }

    // Check if variant key already exists
    const existing = await this.variantRepository.findOne({
      where: { funnelId, variantKey: createDto.variantKey, tenantId },
    });

    if (existing) {
      throw new BadRequestException(`Variant with key "${createDto.variantKey}" already exists`);
    }

    const variant = this.variantRepository.create({
      ...createDto,
      funnelId,
      tenantId,
    });

    const saved = await this.variantRepository.save(variant);
    this.logger.log(`Created variant ${saved.variantKey} for funnel ${funnelId}`);

    return saved;
  }

  /**
   * Get all variants for a funnel
   */
  async findAll(funnelId: string, tenantId: string): Promise<FunnelVariant[]> {
    return await this.variantRepository.find({
      where: { funnelId, tenantId },
      order: { isControl: 'DESC', variantKey: 'ASC' },
    });
  }

  /**
   * Get a specific variant
   */
  async findOne(id: string, tenantId: string): Promise<FunnelVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id, tenantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return variant;
  }

  /**
   * Update a variant
   */
  async update(
    id: string,
    updateDto: UpdateFunnelVariantDto,
    tenantId: string,
  ): Promise<FunnelVariant> {
    const variant = await this.findOne(id, tenantId);

    Object.assign(variant, updateDto);
    return await this.variantRepository.save(variant);
  }

  /**
   * Delete a variant
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const variant = await this.findOne(id, tenantId);

    if (variant.isControl) {
      throw new BadRequestException('Cannot delete control variant');
    }

    await this.variantRepository.softDelete(id);
    this.logger.log(`Deleted variant ${id}`);
  }

  /**
   * Declare a winner and stop the test
   */
  async declareWinner(
    funnelId: string,
    declareDto: DeclareWinnerDto,
    tenantId: string,
  ): Promise<{
    winner: FunnelVariant;
    others: FunnelVariant[];
  }> {
    const winner = await this.findOne(declareDto.variantId, tenantId);

    if (winner.funnelId !== funnelId) {
      throw new BadRequestException('Variant does not belong to this funnel');
    }

    // Update winner status
    winner.status = VariantStatus.WINNER;
    winner.declaredWinnerAt = new Date();
    await this.variantRepository.save(winner);

    // Pause all other variants
    const others = await this.variantRepository.find({
      where: { funnelId, tenantId },
    });

    for (const variant of others) {
      if (variant.id !== winner.id && variant.status === VariantStatus.ACTIVE) {
        variant.status = VariantStatus.PAUSED;
        await this.variantRepository.save(variant);
      }
    }

    this.logger.log(`Declared variant ${winner.variantKey} as winner for funnel ${funnelId}`);

    return {
      winner,
      others: others.filter(v => v.id !== winner.id),
    };
  }

  /**
   * Get variant statistics comparison
   */
  async getComparison(
    funnelId: string,
    tenantId: string,
  ): Promise<{
    variants: FunnelVariant[];
    summary: {
      totalVisitors: number;
      totalConversions: number;
      overallConversionRate: number;
      bestPerforming: string | null;
      statisticalSignificance: boolean;
    };
  }> {
    const variants = await this.findAll(funnelId, tenantId);

    const totalVisitors = variants.reduce((sum, v) => sum + v.visitors, 0);
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    const overallConversionRate = totalVisitors > 0
      ? (totalConversions / totalVisitors) * 100
      : 0;

    // Find best performing variant
    const bestPerforming = variants.reduce((best, current) => {
      if (!best || current.conversionRate > best.conversionRate) {
        return current;
      }
      return best;
    }, null as FunnelVariant | null);

    // Simple statistical significance check (requires minimum sample size)
    const statisticalSignificance = variants.every(v => v.visitors >= 100);

    return {
      variants,
      summary: {
        totalVisitors,
        totalConversions,
        overallConversionRate: parseFloat(overallConversionRate.toFixed(2)),
        bestPerforming: bestPerforming?.variantKey || null,
        statisticalSignificance,
      },
    };
  }

  /**
   * Assign a visitor to a variant (weighted random based on traffic percentage)
   */
  async assignVariant(funnelId: string, tenantId: string): Promise<FunnelVariant> {
    const variants = await this.variantRepository.find({
      where: { funnelId, tenantId, status: VariantStatus.ACTIVE },
    });

    if (variants.length === 0) {
      throw new NotFoundException('No active variants found');
    }

    // Weighted random selection
    const totalWeight = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
    let random = Math.random() * totalWeight;

    for (const variant of variants) {
      random -= variant.trafficPercentage;
      if (random <= 0) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }
}
