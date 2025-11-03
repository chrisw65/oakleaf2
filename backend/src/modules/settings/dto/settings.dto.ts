import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class SetSettingDto {
  @ApiProperty({ description: 'Setting key' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Setting value' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Setting description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether to encrypt this value', default: false })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @ApiPropertyOptional({ description: 'Whether this setting is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class GetSettingDto {
  @ApiProperty({ description: 'Setting key' })
  @IsString()
  key: string;
}

export class SettingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isEncrypted: boolean;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
