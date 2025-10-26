import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutStatus, PayoutMethod } from '../payout.entity';

export class CreatePayoutDto {
  @ApiProperty({ description: 'Affiliate ID' })
  @IsUUID()
  affiliateId: string;

  @ApiProperty({ description: 'Payout amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payout method', enum: PayoutMethod })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiPropertyOptional({ description: 'Payment details' })
  @IsOptional()
  @IsObject()
  paymentDetails?: {
    email?: string;
    transactionId?: string;
    bankAccount?: string;
    reference?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Commission IDs to include in payout' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  commissionIds?: string[];

  @ApiPropertyOptional({ description: 'Number of commissions in payout' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionCount?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePayoutDto {
  @ApiPropertyOptional({ description: 'Payout status' })
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @ApiPropertyOptional({ description: 'Payment details' })
  @IsOptional()
  @IsObject()
  paymentDetails?: {
    email?: string;
    transactionId?: string;
    bankAccount?: string;
    reference?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Failure reason' })
  @IsOptional()
  @IsString()
  failureReason?: string;
}

export class RequestPayoutDto {
  @ApiPropertyOptional({ description: 'Payout method', enum: PayoutMethod })
  @IsOptional()
  @IsEnum(PayoutMethod)
  method?: PayoutMethod;

  @ApiPropertyOptional({ description: 'Payment details' })
  @IsOptional()
  @IsObject()
  paymentDetails?: {
    email?: string;
    bankAccount?: string;
    reference?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessPayoutDto {
  @ApiProperty({ description: 'Payout ID' })
  @IsUUID()
  payoutId: string;

  @ApiPropertyOptional({ description: 'Transaction ID from payment provider' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Additional payment details' })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}

export class BatchPayoutDto {
  @ApiProperty({ description: 'Affiliate IDs to process payouts for' })
  @IsArray()
  @IsUUID('4', { each: true })
  affiliateIds: string[];

  @ApiProperty({ description: 'Payout method', enum: PayoutMethod })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiPropertyOptional({ description: 'Minimum balance for payout' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumBalance?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PayoutQueryDto {
  @ApiPropertyOptional({ description: 'Affiliate ID' })
  @IsOptional()
  @IsUUID()
  affiliateId?: string;

  @ApiPropertyOptional({ description: 'Payout status' })
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @ApiPropertyOptional({ description: 'Payout method' })
  @IsOptional()
  @IsEnum(PayoutMethod)
  method?: PayoutMethod;

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
  @Min(100)
  limit?: number;
}
