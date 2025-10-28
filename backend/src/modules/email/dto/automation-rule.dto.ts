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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  AutomationTrigger,
  AutomationAction,
  AutomationStatus,
} from '../automation-rule.entity';

export class CreateAutomationRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AutomationTrigger })
  @IsEnum(AutomationTrigger)
  trigger: AutomationTrigger;

  @ApiPropertyOptional({ description: 'Trigger conditions', type: Object })
  @IsOptional()
  @IsObject()
  triggerConditions?: {
    tagIds?: string[];
    formIds?: string[];
    productIds?: string[];
    orderStatus?: string[];
    orderMinAmount?: number;
    orderMaxAmount?: number;
    campaignIds?: string[];
    sequenceIds?: string[];
    linkUrls?: string[];
    pageUrls?: string[];
    contactFields?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
      value: any;
    }>;
    delayMinutes?: number;
    hasTag?: string[];
    notHasTag?: string[];
  };

  @ApiProperty({ description: 'Actions to execute', type: [Object] })
  @IsArray()
  actions: Array<{
    type: AutomationAction;
    order: number;
    templateId?: string;
    subject?: string;
    tagIds?: string[];
    sequenceId?: string;
    field?: string;
    value?: any;
    webhookUrl?: string;
    webhookMethod?: 'GET' | 'POST';
    webhookHeaders?: Record<string, string>;
    webhookBody?: Record<string, any>;
    scoreChange?: number;
    pipelineId?: string;
    stageId?: string;
    opportunityValue?: number;
    notificationMessage?: string;
    notificationRecipients?: string[];
  }>;

  @ApiPropertyOptional({ description: 'Run once per contact', default: false })
  @IsOptional()
  @IsBoolean()
  runOnce?: boolean;

  @ApiPropertyOptional({ description: 'Cooldown period in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cooldownMinutes?: number;

  @ApiPropertyOptional({ description: 'Maximum executions per contact' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxExecutionsPerContact?: number;

  @ApiPropertyOptional({ description: 'Active days of week', type: [Number] })
  @IsOptional()
  @IsArray()
  activeDays?: number[];

  @ApiPropertyOptional({ description: 'Active time start (HH:MM)' })
  @IsOptional()
  @IsString()
  activeTimeStart?: string;

  @ApiPropertyOptional({ description: 'Active time end (HH:MM)' })
  @IsOptional()
  @IsString()
  activeTimeEnd?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateAutomationRuleDto extends PartialType(CreateAutomationRuleDto) {
  @ApiPropertyOptional({ enum: AutomationStatus })
  @IsOptional()
  @IsEnum(AutomationStatus)
  status?: AutomationStatus;
}

export class AutomationRuleQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: AutomationStatus })
  @IsOptional()
  @IsEnum(AutomationStatus)
  status?: AutomationStatus;

  @ApiPropertyOptional({ description: 'Filter by trigger', enum: AutomationTrigger })
  @IsOptional()
  @IsEnum(AutomationTrigger)
  trigger?: AutomationTrigger;

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
