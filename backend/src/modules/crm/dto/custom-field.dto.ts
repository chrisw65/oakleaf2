import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomFieldDto {
  @ApiProperty({ description: 'Field display name' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Unique field key' })
  @IsString()
  @Length(1, 100)
  fieldKey: string;

  @ApiProperty({ description: 'Field type: text, number, date, boolean, select, multi_select' })
  @IsString()
  fieldType: string;

  @ApiPropertyOptional({ description: 'Field options (choices, min, max, etc.)' })
  @IsOptional()
  @IsObject()
  options?: {
    choices?: string[];
    min?: number;
    max?: number;
    placeholder?: string;
    defaultValue?: any;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Is field required', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCustomFieldDto {
  @ApiPropertyOptional({ description: 'Field display name' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: 'Field type' })
  @IsOptional()
  @IsString()
  fieldType?: string;

  @ApiPropertyOptional({ description: 'Field options' })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is field required' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is field active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
