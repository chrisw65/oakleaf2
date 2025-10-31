import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsArray,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ElementType } from '../page-element.entity';

export class CreatePageElementDto {
  @ApiProperty({ description: 'Page ID' })
  @IsUUID()
  pageId: string;

  @ApiProperty({ enum: ElementType, description: 'Element type' })
  @IsEnum(ElementType)
  elementType: ElementType;

  @ApiPropertyOptional({ description: 'Element content', type: Object })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Element styles', type: Object })
  @IsOptional()
  @IsObject()
  styles?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Element settings', type: Object })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Parent element ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Element order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Element name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  elementName?: string;

  @ApiPropertyOptional({ description: 'Is visible', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Conditional visibility', type: Object })
  @IsOptional()
  @IsObject()
  conditionalVisibility?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Interactions', type: Object })
  @IsOptional()
  @IsObject()
  interactions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Animations', type: Object })
  @IsOptional()
  @IsObject()
  animations?: Record<string, any>;
}

export class UpdatePageElementDto extends PartialType(CreatePageElementDto) {}

export class DuplicatePageElementDto {
  @ApiProperty({ description: 'Element ID to duplicate' })
  @IsUUID()
  elementId: string;

  @ApiPropertyOptional({ description: 'Target page ID (if different from source)' })
  @IsOptional()
  @IsUUID()
  targetPageId?: string;
}

export class ReorderPageElementsDto {
  @ApiProperty({ description: 'Array of element IDs in new order', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  elementIds: string[];
}
