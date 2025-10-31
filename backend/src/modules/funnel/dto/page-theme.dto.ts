import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ThemeCategory, ThemeStatus } from '../page-theme.entity';

export class CreatePageThemeDto {
  @ApiProperty({ description: 'Theme name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Theme slug (auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ThemeCategory, description: 'Theme category', default: ThemeCategory.BUSINESS })
  @IsEnum(ThemeCategory)
  category: ThemeCategory;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Screenshots', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screenshots?: string[];

  @ApiPropertyOptional({ description: 'Color system', type: Object })
  @IsOptional()
  @IsObject()
  colors?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Typography settings', type: Object })
  @IsOptional()
  @IsObject()
  typography?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Spacing system', type: Object })
  @IsOptional()
  @IsObject()
  spacing?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Border radius settings', type: Object })
  @IsOptional()
  @IsObject()
  borderRadius?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Shadow settings', type: Object })
  @IsOptional()
  @IsObject()
  shadows?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Breakpoints', type: Object })
  @IsOptional()
  @IsObject()
  breakpoints?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Button styles', type: Object })
  @IsOptional()
  @IsObject()
  buttons?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Form styles', type: Object })
  @IsOptional()
  @IsObject()
  forms?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Card styles', type: Object })
  @IsOptional()
  @IsObject()
  cards?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Custom CSS' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ description: 'Custom fonts', type: Array })
  @IsOptional()
  @IsArray()
  customFonts?: Array<{
    name: string;
    url: string;
    fallback?: string;
  }>;

  @ApiPropertyOptional({ description: 'Global styles', type: Object })
  @IsOptional()
  @IsObject()
  globalStyles?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Component-specific styles', type: Object })
  @IsOptional()
  @IsObject()
  components?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Supports dark mode', default: false })
  @IsOptional()
  @IsBoolean()
  supportsDarkMode?: boolean;

  @ApiPropertyOptional({ description: 'Dark mode colors', type: Object })
  @IsOptional()
  @IsObject()
  darkModeColors?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is public theme', default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePageThemeDto extends PartialType(CreatePageThemeDto) {
  @ApiPropertyOptional({ enum: ThemeStatus, description: 'Theme status' })
  @IsOptional()
  @IsEnum(ThemeStatus)
  status?: ThemeStatus;

  @ApiPropertyOptional({ description: 'Is featured theme' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ApplyThemeDto {
  @ApiProperty({ description: 'Theme ID to apply' })
  @IsString()
  themeId: string;

  @ApiProperty({ description: 'Target funnel or page ID' })
  @IsString()
  targetId: string;

  @ApiProperty({ description: 'Apply to funnel or page', enum: ['funnel', 'page'] })
  @IsEnum(['funnel', 'page'])
  targetType: 'funnel' | 'page';
}
