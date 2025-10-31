import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  IsDateString,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CampaignStatus, CampaignType } from '../email-campaign.entity';

export class CreateEmailCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CampaignType, default: CampaignType.BROADCAST })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiPropertyOptional({ description: 'Template ID to use' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Email subject line' })
  @IsString()
  @MaxLength(500)
  subject: string;

  @ApiPropertyOptional({ description: 'Preview text' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preheader?: string;

  @ApiPropertyOptional({ description: 'From name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @ApiPropertyOptional({ description: 'From email' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @ApiPropertyOptional({ description: 'Reply-to email' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  replyTo?: string;

  @ApiProperty({ description: 'HTML content' })
  @IsString()
  htmlContent: string;

  @ApiPropertyOptional({ description: 'Plain text content' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiPropertyOptional({ description: 'Scheduled send time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Segment IDs to target', type: [String] })
  @IsOptional()
  @IsArray()
  segments?: string[];

  @ApiPropertyOptional({ description: 'Tag IDs to target', type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Send to all contacts', default: false })
  @IsOptional()
  @IsBoolean()
  sendToAll?: boolean;

  @ApiPropertyOptional({ description: 'Segment IDs to exclude', type: [String] })
  @IsOptional()
  @IsArray()
  excludeSegments?: string[];

  @ApiPropertyOptional({ description: 'Tag IDs to exclude', type: [String] })
  @IsOptional()
  @IsArray()
  excludeTags?: string[];

  @ApiPropertyOptional({ description: 'Subject line variant B (for A/B testing)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subjectVariantB?: string;

  @ApiPropertyOptional({ description: 'HTML content variant B (for A/B testing)' })
  @IsOptional()
  @IsString()
  htmlContentVariantB?: string;

  @ApiPropertyOptional({ description: 'A/B test percentage for variant B' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  abTestPercentage?: number;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateEmailCampaignDto extends PartialType(CreateEmailCampaignDto) {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class EmailCampaignQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Filter by type', enum: CampaignType })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;
}

export class SendCampaignDto {
  @ApiPropertyOptional({ description: 'Send immediately or use scheduled time', default: false })
  @IsOptional()
  @IsBoolean()
  sendNow?: boolean;

  @ApiPropertyOptional({ description: 'Schedule for this time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
