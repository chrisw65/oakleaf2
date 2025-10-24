import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { FunnelType, FunnelStatus } from '../funnel.entity';

export class CreateFunnelDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FunnelType)
  @IsOptional()
  type?: FunnelType;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  theme?: Record<string, any>;
}

export class UpdateFunnelDto {
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

  @IsEnum(FunnelStatus)
  @IsOptional()
  status?: FunnelStatus;

  @IsEnum(FunnelType)
  @IsOptional()
  type?: FunnelType;

  @IsString()
  @IsOptional()
  customDomain?: string;

  @IsString()
  @IsOptional()
  favicon?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsObject()
  @IsOptional()
  theme?: Record<string, any>;
}

export class PublishFunnelDto {
  @IsBoolean()
  @IsOptional()
  publish?: boolean;
}

export class CloneFunnelDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  slug?: string;
}
