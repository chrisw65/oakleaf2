import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BlockCategory } from '../page-block.entity';

export class CreatePageBlockDto {
  @ApiProperty({ description: 'Block name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Block slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BlockCategory, description: 'Block category' })
  @IsEnum(BlockCategory)
  category: BlockCategory;

  @ApiProperty({ description: 'Block structure (elements and styles)', type: Object })
  @IsObject()
  structure: Record<string, any>;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Is this block public?', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePageBlockDto extends PartialType(CreatePageBlockDto) {}

export class AddBlockToPageDto {
  @ApiProperty({ description: 'Block ID to add' })
  @IsUUID()
  blockId: string;

  @ApiProperty({ description: 'Target page ID' })
  @IsUUID()
  pageId: string;

  @ApiPropertyOptional({ description: 'Position to insert (0 = top)', default: 0 })
  @IsOptional()
  position?: number;
}
