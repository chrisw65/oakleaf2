import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SequenceStatus, SequenceTrigger } from '../email-sequence.entity';
import { StepDelayType } from '../email-sequence-step.entity';

export class EmailSequenceStepDto {
  @ApiProperty({ description: 'Step name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Step position in sequence' })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ description: 'Template ID to use' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Email subject line' })
  @IsString()
  @MaxLength(500)
  subject: string;

  @ApiPropertyOptional({ description: 'Preview text' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preheader?: string;

  @ApiPropertyOptional({ description: 'From name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @ApiPropertyOptional({ description: 'From email' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @ApiPropertyOptional({ description: 'Reply-to email' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  replyTo?: string;

  @ApiProperty({ description: 'HTML content' })
  @IsString()
  htmlContent: string;

  @ApiPropertyOptional({ description: 'Plain text content' })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ enum: StepDelayType, default: StepDelayType.DAYS })
  @IsEnum(StepDelayType)
  delayType: StepDelayType;

  @ApiProperty({ description: 'Delay value (0 for immediate)' })
  @IsNumber()
  @Min(0)
  delayValue: number;

  @ApiPropertyOptional({ description: 'Has conditions', default: false })
  @IsOptional()
  @IsBoolean()
  hasConditions?: boolean;

  @ApiPropertyOptional({ description: 'Step conditions', type: Object })
  @IsOptional()
  @IsObject()
  conditions?: {
    mustOpen?: boolean;
    mustClick?: boolean;
    mustNotOpen?: boolean;
    hasTag?: string[];
    notHasTag?: string[];
  };

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateEmailSequenceDto {
  @ApiProperty({ description: 'Sequence name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Sequence description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SequenceTrigger, default: SequenceTrigger.MANUAL })
  @IsEnum(SequenceTrigger)
  trigger: SequenceTrigger;

  @ApiPropertyOptional({ description: 'Trigger conditions', type: Object })
  @IsOptional()
  @IsObject()
  triggerConditions?: {
    tagIds?: string[];
    formIds?: string[];
    productIds?: string[];
  };

  @ApiPropertyOptional({ description: 'Allow re-enrollment', default: false })
  @IsOptional()
  @IsBoolean()
  allowReenrollment?: boolean;

  @ApiPropertyOptional({ description: 'Re-enrollment delay in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reenrollmentDelay?: number;

  @ApiPropertyOptional({ description: 'Stop on reply', default: true })
  @IsOptional()
  @IsBoolean()
  stopOnReply?: boolean;

  @ApiPropertyOptional({ description: 'Stop on click', default: false })
  @IsOptional()
  @IsBoolean()
  stopOnClick?: boolean;

  @ApiPropertyOptional({ description: 'Stop on unsubscribe', default: false })
  @IsOptional()
  @IsBoolean()
  stopOnUnsubscribe?: boolean;

  @ApiPropertyOptional({ description: 'Timezone mode', default: 'contact_timezone' })
  @IsOptional()
  @IsString()
  timezoneMode?: string;

  @ApiPropertyOptional({ description: 'Preferred send time (HH:MM)' })
  @IsOptional()
  @IsString()
  sendTime?: string;

  @ApiPropertyOptional({ description: 'Days of week to send', type: [Number] })
  @IsOptional()
  @IsArray()
  sendDays?: number[];

  @ApiPropertyOptional({ description: 'Sequence steps', type: [EmailSequenceStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailSequenceStepDto)
  steps?: EmailSequenceStepDto[];

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateEmailSequenceDto extends PartialType(CreateEmailSequenceDto) {
  @ApiPropertyOptional({ enum: SequenceStatus })
  @IsOptional()
  @IsEnum(SequenceStatus)
  status?: SequenceStatus;
}

export class EmailSequenceQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: SequenceStatus })
  @IsOptional()
  @IsEnum(SequenceStatus)
  status?: SequenceStatus;

  @ApiPropertyOptional({ description: 'Filter by trigger', enum: SequenceTrigger })
  @IsOptional()
  @IsEnum(SequenceTrigger)
  trigger?: SequenceTrigger;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number;
}

export class EnrollContactsDto {
  @ApiProperty({ description: 'Contact IDs to enroll', type: [String] })
  @IsArray()
  @IsString({ each: true })
  contactIds: string[];
}

export class AddSequenceStepDto extends EmailSequenceStepDto {}

export class UpdateSequenceStepDto extends PartialType(EmailSequenceStepDto) {}

export class ReorderStepsDto {
  @ApiProperty({ description: 'Array of step IDs in new order', type: [String] })
  @IsArray()
  @IsString({ each: true })
  stepIds: string[];
}
