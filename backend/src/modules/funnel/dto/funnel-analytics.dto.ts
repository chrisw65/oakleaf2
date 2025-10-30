import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsPeriod } from '../funnel-analytics.entity';

export class FunnelAnalyticsQueryDto {
  @ApiPropertyOptional({ enum: AnalyticsPeriod, default: AnalyticsPeriod.DAILY })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Specific variant ID for comparison' })
  @IsOptional()
  @IsString()
  variantId?: string;
}

export class FunnelInsightsDto {
  @ApiPropertyOptional({ description: 'Number of days to analyze', default: 30 })
  @IsOptional()
  days?: number;

  @ApiPropertyOptional({ description: 'Include recommendations', default: true })
  @IsOptional()
  includeRecommendations?: boolean;
}
