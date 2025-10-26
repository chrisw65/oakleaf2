import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsObject,
  Length,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStatus, OpportunityPriority } from '../opportunity.entity';

export class CreateOpportunityDto {
  @ApiProperty({ description: 'Opportunity title' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ description: 'Opportunity description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Contact ID' })
  @IsUUID()
  contactId: string;

  @ApiProperty({ description: 'Pipeline ID' })
  @IsUUID()
  pipelineId: string;

  @ApiProperty({ description: 'Stage ID' })
  @IsUUID()
  stageId: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Deal value', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 10)
  currency?: string;

  @ApiPropertyOptional({ description: 'Win probability (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ description: 'Priority', enum: OpportunityPriority })
  @IsOptional()
  @IsEnum(OpportunityPriority)
  priority?: OpportunityPriority;

  @ApiPropertyOptional({ description: 'Expected close date (ISO 8601)' })
  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    source?: string;
    productInterest?: string[];
    notes?: string;
    [key: string]: any;
  };
}

export class UpdateOpportunityDto {
  @ApiPropertyOptional({ description: 'Opportunity title' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiPropertyOptional({ description: 'Opportunity description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Stage ID' })
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Deal value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Win probability (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ description: 'Status', enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @ApiPropertyOptional({ description: 'Priority', enum: OpportunityPriority })
  @IsOptional()
  @IsEnum(OpportunityPriority)
  priority?: OpportunityPriority;

  @ApiPropertyOptional({ description: 'Expected close date (ISO 8601)' })
  @IsOptional()
  @IsString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MoveOpportunityDto {
  @ApiProperty({ description: 'Target stage ID' })
  @IsUUID()
  stageId: string;

  @ApiPropertyOptional({ description: 'Position in new stage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}

export class WinOpportunityDto {
  @ApiPropertyOptional({ description: 'Actual close date (ISO 8601)' })
  @IsOptional()
  @IsString()
  actualCloseDate?: string;

  @ApiPropertyOptional({ description: 'Win notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LoseOpportunityDto {
  @ApiProperty({ description: 'Reason for losing' })
  @IsString()
  @Length(1, 255)
  lostReason: string;

  @ApiPropertyOptional({ description: 'Actual close date (ISO 8601)' })
  @IsOptional()
  @IsString()
  actualCloseDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OpportunityQueryDto {
  @ApiPropertyOptional({ description: 'Search query (title, description)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by pipeline ID' })
  @IsOptional()
  @IsUUID()
  pipelineId?: string;

  @ApiPropertyOptional({ description: 'Filter by stage ID' })
  @IsOptional()
  @IsUUID()
  stageId?: string;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @ApiPropertyOptional({ description: 'Filter by priority', enum: OpportunityPriority })
  @IsOptional()
  @IsEnum(OpportunityPriority)
  priority?: OpportunityPriority;

  @ApiPropertyOptional({ description: 'Minimum value' })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum value' })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
