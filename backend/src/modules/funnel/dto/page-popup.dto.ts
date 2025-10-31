import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PopupTrigger, PopupType } from '../page-popup.entity';

export class CreatePagePopupDto {
  @ApiProperty({ description: 'Page ID' })
  @IsUUID()
  pageId: string;

  @ApiProperty({ description: 'Popup name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PopupType, description: 'Popup type' })
  @IsEnum(PopupType)
  popupType: PopupType;

  @ApiProperty({ enum: PopupTrigger, description: 'Trigger type' })
  @IsEnum(PopupTrigger)
  trigger: PopupTrigger;

  @ApiPropertyOptional({ description: 'Trigger configuration', type: Object })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>;

  @ApiProperty({ description: 'Popup content', type: Object })
  @IsObject()
  content: Record<string, any>;

  @ApiPropertyOptional({ description: 'Popup styles', type: Object })
  @IsOptional()
  @IsObject()
  styles?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Popup settings', type: Object })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePagePopupDto extends PartialType(CreatePagePopupDto) {}
