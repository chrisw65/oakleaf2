import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { GoalType, GoalStatus } from '../funnel-goal.entity';
import { SuggestionType, SuggestionPriority, SuggestionStatus } from '../funnel-suggestion.entity';
import { ConditionType, ConditionOperator } from '../funnel-condition.entity';

// Goal DTOs
export class CreateFunnelGoalDto {
  @ApiProperty({ description: 'Goal name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiPropertyOptional({ description: 'Is primary goal?', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ description: 'Goal configuration', type: Object })
  @IsOptional()
  @IsObject()
  config?: any;

  @ApiPropertyOptional({ description: 'Monetary value', default: 0 })
  @IsOptional()
  @IsNumber()
  value?: number;
}

export class UpdateFunnelGoalDto extends PartialType(CreateFunnelGoalDto) {
  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}

// Condition DTOs
export class CreateFunnelConditionDto {
  @ApiProperty({ description: 'Condition name' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ConditionType })
  @IsEnum(ConditionType)
  type: ConditionType;

  @ApiPropertyOptional({ description: 'Page ID' })
  @IsOptional()
  @IsString()
  pageId?: string;

  @ApiProperty({ description: 'Condition rules', type: [Object] })
  @IsArray()
  rules: Array<{
    field: string;
    operator: ConditionOperator;
    value: any;
    fieldType?: string;
  }>;

  @ApiPropertyOptional({ description: 'Logic operator', default: 'AND' })
  @IsOptional()
  logicOperator?: 'AND' | 'OR';

  @ApiProperty({ description: 'Actions when condition is met', type: [Object] })
  @IsArray()
  actions: Array<{
    type: string;
    config: any;
    order: number;
  }>;

  @ApiPropertyOptional({ description: 'Actions when condition fails', type: [Object] })
  @IsOptional()
  @IsArray()
  elseActions?: Array<{
    type: string;
    config: any;
    order: number;
  }>;

  @ApiPropertyOptional({ description: 'Targeting options', type: Object })
  @IsOptional()
  @IsObject()
  targeting?: any;
}

export class UpdateFunnelConditionDto extends PartialType(CreateFunnelConditionDto) {
  @ApiPropertyOptional({ description: 'Is active?', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Suggestion DTOs
export class FunnelSuggestionQueryDto {
  @ApiPropertyOptional({ enum: SuggestionType })
  @IsOptional()
  @IsEnum(SuggestionType)
  type?: SuggestionType;

  @ApiPropertyOptional({ enum: SuggestionPriority })
  @IsOptional()
  @IsEnum(SuggestionPriority)
  priority?: SuggestionPriority;

  @ApiPropertyOptional({ enum: SuggestionStatus })
  @IsOptional()
  @IsEnum(SuggestionStatus)
  status?: SuggestionStatus;
}

export class UpdateSuggestionStatusDto {
  @ApiProperty({ enum: SuggestionStatus })
  @IsEnum(SuggestionStatus)
  status: SuggestionStatus;

  @ApiPropertyOptional({ description: 'Dismissal reason if dismissing' })
  @IsOptional()
  @IsString()
  dismissalReason?: string;
}

export class GenerateSuggestionsDto {
  @ApiPropertyOptional({ description: 'Minimum days of data required', default: 7 })
  @IsOptional()
  @IsNumber()
  minimumDays?: number;

  @ApiPropertyOptional({ description: 'Include all suggestion types', default: true })
  @IsOptional()
  @IsBoolean()
  includeAll?: boolean;
}

// Session Tracking DTOs
export class TrackSessionDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiPropertyOptional({ description: 'IP Address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User Agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'UTM parameters', type: Object })
  @IsOptional()
  @IsObject()
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export class TrackEventDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Event type' })
  @IsString()
  eventType: string;

  @ApiPropertyOptional({ description: 'Event name' })
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional({ description: 'Page ID' })
  @IsOptional()
  @IsString()
  pageId?: string;

  @ApiPropertyOptional({ description: 'Element ID' })
  @IsOptional()
  @IsString()
  elementId?: string;

  @ApiPropertyOptional({ description: 'Event data', type: Object })
  @IsOptional()
  @IsObject()
  eventData?: any;

  @ApiPropertyOptional({ description: 'Is conversion?', default: false })
  @IsOptional()
  @IsBoolean()
  isConversion?: boolean;

  @ApiPropertyOptional({ description: 'Conversion value', default: 0 })
  @IsOptional()
  @IsNumber()
  conversionValue?: number;
}
