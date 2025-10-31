import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SegmentType, SegmentStatus } from '../segment.entity';

export class CreateSegmentDto {
  @ApiProperty({ description: 'Segment name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Segment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SegmentType, default: SegmentType.DYNAMIC })
  @IsEnum(SegmentType)
  type: SegmentType;

  @ApiPropertyOptional({ description: 'Segment conditions (for dynamic segments)', type: Object })
  @IsOptional()
  @IsObject()
  conditions?: {
    matchType?: 'all' | 'any';
    tags?: {
      operator: 'has_all' | 'has_any' | 'has_none';
      tagIds: string[];
    };
    customFields?: Array<{
      fieldId: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
      value?: any;
    }>;
    email?: {
      operator: 'contains' | 'not_contains' | 'ends_with' | 'starts_with';
      value: string;
    };
    leadScore?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };
    lifetimeValue?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };
    emailEngagement?: {
      campaignIds?: string[];
      sequenceIds?: string[];
      opened?: boolean;
      clicked?: boolean;
      minOpenRate?: number;
      minClickRate?: number;
      lastEngagedDays?: number;
    };
    hasPurchased?: boolean;
    purchasedProducts?: string[];
    totalOrders?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };
    totalSpent?: {
      operator: 'greater_than' | 'less_than' | 'equals' | 'between';
      value: number | [number, number];
    };
    lastPurchaseDays?: number;
    hasAbandonedCart?: boolean;
    cartValue?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };
    createdAt?: {
      operator: 'after' | 'before' | 'between' | 'last_days';
      value: string | [string, string] | number;
    };
    hasOpportunity?: boolean;
    opportunityStatus?: string[];
    opportunityValue?: {
      operator: 'greater_than' | 'less_than' | 'equals';
      value: number;
    };
    visitedPages?: {
      urls: string[];
      operator: 'any' | 'all';
    };
    country?: string[];
    state?: string[];
    city?: string[];
  };

  @ApiPropertyOptional({ description: 'Contact IDs (for static segments)', type: [String] })
  @IsOptional()
  @IsArray()
  contactIds?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateSegmentDto extends PartialType(CreateSegmentDto) {
  @ApiPropertyOptional({ enum: SegmentStatus })
  @IsOptional()
  @IsEnum(SegmentStatus)
  status?: SegmentStatus;
}

export class SegmentQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type', enum: SegmentType })
  @IsOptional()
  @IsEnum(SegmentType)
  type?: SegmentType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: SegmentStatus })
  @IsOptional()
  @IsEnum(SegmentStatus)
  status?: SegmentStatus;

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

export class AddContactsToSegmentDto {
  @ApiProperty({ description: 'Contact IDs to add', type: [String] })
  @IsArray()
  @IsString({ each: true })
  contactIds: string[];
}

export class RemoveContactsFromSegmentDto {
  @ApiProperty({ description: 'Contact IDs to remove', type: [String] })
  @IsArray()
  @IsString({ each: true })
  contactIds: string[];
}
