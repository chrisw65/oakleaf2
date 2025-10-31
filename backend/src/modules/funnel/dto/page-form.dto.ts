import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { FormType } from '../page-form.entity';

export class CreatePageFormDto {
  @ApiPropertyOptional({ description: 'Page ID (optional for standalone forms)' })
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @ApiProperty({ description: 'Form name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: FormType, description: 'Form type', default: FormType.CONTACT })
  @IsEnum(FormType)
  formType: FormType;

  @ApiProperty({ description: 'Form fields', type: Array })
  @IsArray()
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
    defaultValue?: any;
    validation?: any;
    options?: any[];
    conditionalLogic?: any;
    width?: string;
    cssClass?: string;
    styles?: any;
    helpText?: string;
    order: number;
  }>;

  @ApiPropertyOptional({ description: 'Is multi-step form', default: false })
  @IsOptional()
  @IsBoolean()
  isMultiStep?: boolean;

  @ApiPropertyOptional({ description: 'Form steps (for multi-step forms)', type: Array })
  @IsOptional()
  @IsArray()
  steps?: Array<{
    id: string;
    title: string;
    description?: string;
    fieldIds: string[];
    order: number;
  }>;

  @ApiPropertyOptional({ description: 'Submit configuration', type: Object })
  @IsOptional()
  @IsObject()
  submitConfig?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Form actions', type: Array })
  @IsOptional()
  @IsArray()
  actions?: Array<{
    type: string;
    config: any;
    order: number;
  }>;

  @ApiPropertyOptional({ description: 'Integration settings', type: Object })
  @IsOptional()
  @IsObject()
  integrations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Enable CAPTCHA', default: true })
  @IsOptional()
  @IsBoolean()
  enableCaptcha?: boolean;

  @ApiPropertyOptional({ description: 'Enable honeypot', default: true })
  @IsOptional()
  @IsBoolean()
  enableHoneypot?: boolean;

  @ApiPropertyOptional({ description: 'Rate limit (submissions per hour per IP)', default: 5 })
  @IsOptional()
  rateLimit?: number;
}

export class UpdatePageFormDto extends PartialType(CreatePageFormDto) {
  @ApiPropertyOptional({ description: 'Is form active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubmitFormDto {
  @ApiProperty({ description: 'Form ID' })
  @IsUUID()
  formId: string;

  @ApiProperty({ description: 'Form data', type: Object })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Session tracking data', type: Object })
  @IsOptional()
  @IsObject()
  sessionData?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    utmParams?: Record<string, string>;
  };
}
