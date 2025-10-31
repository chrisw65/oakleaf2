import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VariantStatus } from '../funnel-variant.entity';

export class CreateFunnelVariantDto {
  @ApiProperty({ description: 'Variant name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Variant key (A, B, C, etc.)' })
  @IsString()
  @MaxLength(10)
  variantKey: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is this the control variant?', default: false })
  @IsOptional()
  @IsBoolean()
  isControl?: boolean;

  @ApiPropertyOptional({ description: 'Traffic percentage (0-100)', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  trafficPercentage?: number;

  @ApiPropertyOptional({ description: 'Page-specific content overrides', type: Object })
  @IsOptional()
  @IsObject()
  pageOverrides?: Record<string, any>;
}

export class UpdateFunnelVariantDto extends PartialType(CreateFunnelVariantDto) {
  @ApiPropertyOptional({ enum: VariantStatus })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;
}

export class DeclareWinnerDto {
  @ApiProperty({ description: 'Variant ID to declare as winner' })
  @IsString()
  variantId: string;
}
