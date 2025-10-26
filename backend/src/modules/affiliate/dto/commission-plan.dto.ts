import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionType, RecurringType } from '../commission-plan.entity';

export class CreateCommissionPlanDto {
  @ApiProperty({ description: 'Plan name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Commission type', enum: CommissionType })
  @IsEnum(CommissionType)
  type: CommissionType;

  @ApiProperty({ description: 'Recurring type', enum: RecurringType })
  @IsEnum(RecurringType)
  recurringType: RecurringType;

  @ApiPropertyOptional({ description: 'Tier 1 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier1Rate?: number;

  @ApiPropertyOptional({ description: 'Tier 2 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier2Rate?: number;

  @ApiPropertyOptional({ description: 'Tier 3 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier3Rate?: number;

  @ApiPropertyOptional({ description: 'Cookie duration in days', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  cookieDurationDays?: number;

  @ApiPropertyOptional({ description: 'Commission hold period in days', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  commissionHoldDays?: number;

  @ApiPropertyOptional({ description: 'Minimum payout amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPayout?: number;

  @ApiPropertyOptional({ description: 'Plan settings' })
  @IsOptional()
  @IsObject()
  settings?: {
    allowSubAffiliates?: boolean;
    requireApproval?: boolean;
    maxTierDepth?: number;
    payoutFrequency?: string;
    attribution?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Is plan active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is default plan', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCommissionPlanDto {
  @ApiPropertyOptional({ description: 'Plan name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Commission type' })
  @IsOptional()
  @IsEnum(CommissionType)
  type?: CommissionType;

  @ApiPropertyOptional({ description: 'Recurring type' })
  @IsOptional()
  @IsEnum(RecurringType)
  recurringType?: RecurringType;

  @ApiPropertyOptional({ description: 'Tier 1 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier1Rate?: number;

  @ApiPropertyOptional({ description: 'Tier 2 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier2Rate?: number;

  @ApiPropertyOptional({ description: 'Tier 3 commission rate (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tier3Rate?: number;

  @ApiPropertyOptional({ description: 'Cookie duration in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  cookieDurationDays?: number;

  @ApiPropertyOptional({ description: 'Commission hold period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  commissionHoldDays?: number;

  @ApiPropertyOptional({ description: 'Minimum payout amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPayout?: number;

  @ApiPropertyOptional({ description: 'Plan settings' })
  @IsOptional()
  @IsObject()
  settings?: {
    allowSubAffiliates?: boolean;
    requireApproval?: boolean;
    maxTierDepth?: number;
    payoutFrequency?: string;
    attribution?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Is plan active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is default plan' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
