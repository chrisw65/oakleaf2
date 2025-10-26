import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsObject,
  IsArray,
  IsUUID,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactSource, ContactStatus } from '../contact.entity';

export class CreateContactDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  lastName?: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  company?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP/Postal code' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Contact source', enum: ContactSource })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @ApiPropertyOptional({ description: 'Contact status', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Lead score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Tag IDs to associate' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Custom field values' })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Social media profiles' })
  @IsOptional()
  @IsObject()
  socialProfiles?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    [key: string]: any;
  };
}

export class UpdateContactDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP/Postal code' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Contact status', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Lead score' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Social media profiles' })
  @IsOptional()
  @IsObject()
  socialProfiles?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ContactQueryDto {
  @ApiPropertyOptional({ description: 'Search query (name, email, company)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ContactStatus })
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @ApiPropertyOptional({ description: 'Filter by source', enum: ContactSource })
  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter by tag IDs (comma-separated)' })
  @IsOptional()
  @IsString()
  tagIds?: string;

  @ApiPropertyOptional({ description: 'Minimum lead score' })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional({ description: 'Maximum lead score' })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Created after (ISO 8601)' })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Created before (ISO 8601)' })
  @IsOptional()
  @IsString()
  createdBefore?: string;

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

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class ImportContactsDto {
  @ApiProperty({ description: 'CSV data as string' })
  @IsString()
  csvData: string;

  @ApiPropertyOptional({ description: 'Skip duplicate emails', default: true })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @ApiPropertyOptional({ description: 'Owner ID for all imported contacts' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Tag IDs to apply to all imported contacts' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

export class AddNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  @Length(1, 5000)
  content: string;
}

export class AddTagsDto {
  @ApiProperty({ description: 'Tag IDs to add' })
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}

export class RemoveTagsDto {
  @ApiProperty({ description: 'Tag IDs to remove' })
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds: string[];
}
