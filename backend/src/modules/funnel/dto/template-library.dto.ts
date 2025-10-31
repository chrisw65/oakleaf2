import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTemplateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Category slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateTemplateCategoryDto extends PartialType(CreateTemplateCategoryDto) {}

export class CreateTemplateReviewDto {
  @ApiProperty({ description: 'Template ID' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ description: 'Rating (1-5 stars)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review text' })
  @IsOptional()
  @IsString()
  review?: string;
}

export class UpdateTemplateReviewDto extends PartialType(CreateTemplateReviewDto) {
  @ApiPropertyOptional({ description: 'Mark review as helpful' })
  @IsOptional()
  @IsBoolean()
  isHelpful?: boolean;
}

export class SaveFunnelAsTemplateDto {
  @ApiProperty({ description: 'Funnel ID to save as template' })
  @IsUUID()
  funnelId: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Make template public', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;
}

export class CloneTemplateDto {
  @ApiProperty({ description: 'Template ID to clone' })
  @IsUUID()
  templateId: string;

  @ApiPropertyOptional({ description: 'Custom name for cloned funnel' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
