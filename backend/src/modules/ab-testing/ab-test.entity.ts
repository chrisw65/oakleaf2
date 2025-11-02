import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum TestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TestType {
  PAGE = 'page',
  FUNNEL = 'funnel',
  EMAIL = 'email',
  HEADLINE = 'headline',
  CTA = 'cta',
  PRICING = 'pricing',
  CUSTOM = 'custom',
}

export enum WinnerSelectionMethod {
  MANUAL = 'manual',
  CONVERSIONS = 'conversions',
  REVENUE = 'revenue',
  ENGAGEMENT = 'engagement',
}

/**
 * A/B Test entity for managing split tests
 */
@Entity('ab_tests')
@Index(['tenantId', 'status'])
@Index(['resourceType', 'resourceId'])
export class ABTest extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: TestType })
  type: TestType;

  @Column({ type: 'enum', enum: TestStatus, default: TestStatus.DRAFT })
  status: TestStatus;

  @Column({ nullable: true })
  resourceType?: string; // e.g., 'funnel', 'page', 'email'

  @Column({ nullable: true })
  resourceId?: string; // ID of the resource being tested

  // Test Configuration
  @Column({ type: 'jsonb' })
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    weight: number; // Traffic allocation percentage (0-100)
    isControl: boolean;
    config?: Record<string, any>; // Variant-specific configuration
  }>;

  @Column({ type: 'int', default: 0 })
  trafficAllocation: number; // Percentage of total traffic to include in test (0-100)

  // Goal Configuration
  @Column({ type: 'varchar', length: 100 })
  goalMetric: string; // e.g., 'conversions', 'revenue', 'clicks', 'signups'

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetImprovement?: number; // Target improvement percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 95 })
  confidenceLevel: number; // Statistical confidence level (e.g., 95%)

  // Test Period
  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'int', nullable: true })
  minSampleSize?: number; // Minimum participants per variant

  @Column({ type: 'int', nullable: true })
  maxDuration?: number; // Maximum test duration in days

  // Results
  @Column({ nullable: true })
  winnerId?: string; // ID of the winning variant

  @Column({ type: 'enum', enum: WinnerSelectionMethod, default: WinnerSelectionMethod.MANUAL })
  winnerSelectionMethod: WinnerSelectionMethod;

  @Column({ type: 'timestamp', nullable: true })
  winnerSelectedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  results?: {
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
    averageOrderValue?: number;
    engagement?: number;
    confidence?: number;
    isWinner?: boolean;
  }[];

  // Metadata
  @Column({ nullable: true })
  createdBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /**
   * Check if test is running
   */
  isRunning(): boolean {
    return this.status === TestStatus.RUNNING;
  }

  /**
   * Check if test is completed
   */
  isCompleted(): boolean {
    return this.status === TestStatus.COMPLETED;
  }

  /**
   * Check if test has a winner
   */
  hasWinner(): boolean {
    return this.winnerId !== null && this.winnerId !== undefined;
  }

  /**
   * Get total traffic allocation across all variants
   */
  getTotalVariantWeight(): number {
    return this.variants.reduce((sum, variant) => sum + variant.weight, 0);
  }

  /**
   * Get control variant
   */
  getControlVariant() {
    return this.variants.find((v) => v.isControl);
  }

  /**
   * Get variant by ID
   */
  getVariant(variantId: string) {
    return this.variants.find((v) => v.id === variantId);
  }

  /**
   * Get test duration in days
   */
  getDuration(): number | null {
    if (!this.startedAt || !this.endedAt) {
      return null;
    }
    const diff = this.endedAt.getTime() - this.startedAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if test should auto-complete
   */
  shouldAutoComplete(): boolean {
    if (!this.isRunning()) {
      return false;
    }

    // Check if max duration exceeded
    if (this.maxDuration && this.startedAt) {
      const now = new Date();
      const daysSinceStart = Math.floor(
        (now.getTime() - this.startedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceStart >= this.maxDuration) {
        return true;
      }
    }

    // Check if minimum sample size reached and winner detected
    if (this.minSampleSize && this.results) {
      const allVariantsHaveMinSample = this.results.every(
        (r) => r.participants >= this.minSampleSize,
      );
      if (allVariantsHaveMinSample && this.hasStatisticalSignificance()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if results have statistical significance
   */
  hasStatisticalSignificance(): boolean {
    if (!this.results || this.results.length < 2) {
      return false;
    }

    // Find variant with highest confidence
    const maxConfidence = Math.max(...this.results.map((r) => r.confidence || 0));
    return maxConfidence >= this.confidenceLevel;
  }
}
