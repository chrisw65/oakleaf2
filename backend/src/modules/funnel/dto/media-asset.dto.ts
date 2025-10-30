import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AssetType } from '../media-asset.entity';

export class CreateMediaAssetDto {
  @ApiProperty({ description: 'Asset name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  @MaxLength(500)
  filename: string;

  @ApiProperty({ enum: AssetType, description: 'Asset type' })
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  @MaxLength(100)
  mimeType: string;

  @ApiProperty({ description: 'Asset URL' })
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'File size in bytes', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Width (for images/videos)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ description: 'Height (for images/videos)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ description: 'Duration in seconds (for videos/audio)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'Folder path' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  folder?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Alt text for images' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMediaAssetDto extends PartialType(CreateMediaAssetDto) {}

export class MediaAssetQueryDto {
  @ApiPropertyOptional({ enum: AssetType, description: 'Filter by asset type' })
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @ApiPropertyOptional({ description: 'Filter by folder' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Search by name or tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
