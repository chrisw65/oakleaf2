import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsObject,
  IsNumber,
  Min,
  Max,
  IsUUID,
  Length,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateStatus } from '../affiliate.entity';

export class RegisterAffiliateDto {
  @ApiPropertyOptional({ description: 'Parent affiliate code for sub-affiliate registration' })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  parentAffiliateCode?: string;

  @ApiPropertyOptional({ description: 'Commission plan ID' })
  @IsOptional()
  @IsUUID()
  commissionPlanId?: string;

  @ApiPropertyOptional({ description: 'Preferred affiliate code' })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  preferredCode?: string;

  @ApiPropertyOptional({ description: 'Payment method: paypal, bank, stripe' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment email (for PayPal)' })
  @IsOptional()
  @IsEmail()
  paymentEmail?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @IsObject()
  socialMedia?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAffiliateDto {
  @ApiPropertyOptional({ description: 'Affiliate status' })
  @IsOptional()
  @IsEnum(AffiliateStatus)
  status?: AffiliateStatus;

  @ApiPropertyOptional({ description: 'Commission plan ID' })
  @IsOptional()
  @IsUUID()
  commissionPlanId?: string;

  @ApiPropertyOptional({ description: 'Payment information' })
  @IsOptional()
  @IsObject()
  paymentInfo?: {
    method?: string;
    email?: string;
    bankAccount?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    companyName?: string;
    website?: string;
    socialMedia?: Record<string, string>;
    notes?: string;
    [key: string]: any;
  };
}

export class GenerateAffiliateLinkDto {
  @ApiProperty({ description: 'URL to generate affiliate link for' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'UTM source' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ description: 'UTM medium' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ description: 'UTM campaign' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;
}

export class TrackClickDto {
  @ApiProperty({ description: 'Affiliate code' })
  @IsString()
  @Length(3, 50)
  affiliateCode: string;

  @ApiPropertyOptional({ description: 'Visitor ID (cookie/session)' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'Landing page URL' })
  @IsOptional()
  @IsString()
  landingPage?: string;

  @ApiPropertyOptional({ description: 'UTM parameters' })
  @IsOptional()
  @IsObject()
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    [key: string]: any;
  };
}

export class AffiliateStatsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Number of days to look back', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number;
}
