import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionStatus } from '../commission.entity';

export class CreateCommissionDto {
  @ApiProperty({ description: 'Affiliate ID' })
  @IsUUID()
  affiliateId: string;

  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Commission amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Commission tier (1, 2, or 3)' })
  @IsNumber()
  @Min(1)
  @Max(3)
  tier: number;

  @ApiProperty({ description: 'Commission rate applied' })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @ApiProperty({ description: 'Order amount' })
  @IsNumber()
  @Min(0)
  orderAmount: number;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Click ID that led to conversion' })
  @IsOptional()
  @IsUUID()
  clickId?: string;

  @ApiPropertyOptional({ description: 'Commission plan ID' })
  @IsOptional()
  @IsUUID()
  commissionPlanId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateCommissionDto {
  @ApiPropertyOptional({ description: 'Commission status' })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveCommissionDto {
  @ApiProperty({ description: 'Commission ID' })
  @IsUUID()
  commissionId: string;

  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectCommissionDto {
  @ApiProperty({ description: 'Commission ID' })
  @IsUUID()
  commissionId: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  reason: string;
}

export class CommissionQueryDto {
  @ApiPropertyOptional({ description: 'Affiliate ID' })
  @IsOptional()
  @IsUUID()
  affiliateId?: string;

  @ApiPropertyOptional({ description: 'Commission status' })
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @ApiPropertyOptional({ description: 'Tier (1, 2, or 3)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  tier?: number;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
