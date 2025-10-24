import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { PageType } from '../page.entity';

export class CreatePageDto {
  @IsString()
  funnelId: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PageType)
  @IsOptional()
  type?: PageType;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsObject()
  content: Record<string, any>;

  @IsObject()
  @IsOptional()
  seoSettings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  styles?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdatePageDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PageType)
  @IsOptional()
  type?: PageType;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsObject()
  @IsOptional()
  seoSettings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  styles?: Record<string, any>;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  thumbnail?: string;
}

export class CreatePageVariantDto {
  @IsString()
  pageId: string;

  @IsString()
  @MaxLength(50)
  variantName: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  trafficSplit?: number;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;
}

export class ReorderPagesDto {
  @IsObject()
  pageOrder: Record<string, number>; // { pageId: position }
}
