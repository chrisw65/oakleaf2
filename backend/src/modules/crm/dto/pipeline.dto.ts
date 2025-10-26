import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePipelineStageDto {
  @ApiProperty({ description: 'Stage name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Stage position' })
  @IsOptional()
  @IsString()
  position?: number;

  @ApiPropertyOptional({ description: 'Win probability (0-100)', default: 50 })
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({ description: 'Hex color code', default: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreatePipelineDto {
  @ApiProperty({ description: 'Pipeline name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Pipeline description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is this the default pipeline', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Pipeline stages' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePipelineStageDto)
  stages?: CreatePipelineStageDto[];

  @ApiPropertyOptional({ description: 'Pipeline settings' })
  @IsOptional()
  @IsObject()
  settings?: {
    currency?: string;
    probabilityByStage?: Record<string, number>;
    autoArchiveDays?: number;
    [key: string]: any;
  };
}

export class UpdatePipelineDto {
  @ApiPropertyOptional({ description: 'Pipeline name' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @ApiPropertyOptional({ description: 'Pipeline description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Is pipeline active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is this the default pipeline' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Pipeline settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdatePipelineStageDto {
  @ApiPropertyOptional({ description: 'Stage name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Stage position' })
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({ description: 'Win probability (0-100)' })
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({ description: 'Hex color code' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Is stage active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddPipelineStageDto {
  @ApiProperty({ description: 'Stage name' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ description: 'Insert after stage ID' })
  @IsOptional()
  @IsString()
  afterStageId?: string;

  @ApiPropertyOptional({ description: 'Win probability (0-100)', default: 50 })
  @IsOptional()
  probability?: number;

  @ApiPropertyOptional({ description: 'Hex color code', default: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class ReorderStagesDto {
  @ApiProperty({ description: 'Array of stage IDs in new order' })
  @IsArray()
  @IsString({ each: true })
  stageIds: string[];
}
