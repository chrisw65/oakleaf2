import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TemplateType, TemplateStatus } from '../email-template.entity';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Unique URL slug' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TemplateType, default: TemplateType.MARKETING })
  @IsEnum(TemplateType)
  type: TemplateType;

  @ApiProperty({ enum: TemplateStatus, default: TemplateStatus.DRAFT })
  @IsEnum(TemplateStatus)
  status: TemplateStatus;

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

  @ApiPropertyOptional({ description: 'From email address' })
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

  @ApiPropertyOptional({ description: 'MJML source code' })
  @IsOptional()
  @IsString()
  mjmlContent?: string;

  @ApiPropertyOptional({ description: 'Available variables', type: [Object] })
  @IsOptional()
  @IsArray()
  variables?: Array<{
    name: string;
    placeholder: string;
    description?: string;
    defaultValue?: string;
  }>;

  @ApiPropertyOptional({ description: 'Design settings', type: Object })
  @IsOptional()
  @IsObject()
  designSettings?: {
    backgroundColor?: string;
    contentWidth?: number;
    fontFamily?: string;
    primaryColor?: string;
    buttonColor?: string;
  };

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {}

export class EmailTemplateQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type', enum: TemplateType })
  @IsOptional()
  @IsEnum(TemplateType)
  type?: TemplateType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: TemplateStatus })
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @ApiPropertyOptional({ description: 'Search by name or subject' })
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

export class TestEmailDto {
  @ApiProperty({ description: 'Test recipient email address' })
  @IsString()
  @MaxLength(255)
  recipientEmail: string;

  @ApiPropertyOptional({ description: 'Test data for variables', type: Object })
  @IsOptional()
  @IsObject()
  testData?: Record<string, any>;
}
