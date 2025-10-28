import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmailStatus, EmailType } from '../email-log.entity';

export class EmailLogQueryDto {
  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by email type', enum: EmailType })
  @IsOptional()
  @IsEnum(EmailType)
  emailType?: EmailType;

  @ApiPropertyOptional({ description: 'Filter by campaign ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ description: 'Filter by sequence ID' })
  @IsOptional()
  @IsString()
  sequenceId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: EmailStatus })
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @ApiPropertyOptional({ description: 'Filter by recipient email' })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Filter by date range start' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by date range end' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;
}
