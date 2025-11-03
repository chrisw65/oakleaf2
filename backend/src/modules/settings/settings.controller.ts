import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { SetSettingDto, SettingResponseDto } from './dto/settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings for current tenant' })
  @ApiResponse({ status: 200, description: 'Settings retrieved', type: [SettingResponseDto] })
  async getAll(@Request() req: any): Promise<SettingResponseDto[]> {
    const tenantId = req.user.tenantId;
    return await this.settingsService.getAll(tenantId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a specific setting value' })
  @ApiResponse({ status: 200, description: 'Setting value retrieved' })
  async get(@Request() req: any, @Param('key') key: string): Promise<{ value: string | null }> {
    const tenantId = req.user.tenantId;
    const value = await this.settingsService.get(tenantId, key);
    return { value };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set a setting value (Admin only)' })
  @ApiResponse({ status: 200, description: 'Setting saved', type: SettingResponseDto })
  async set(@Request() req: any, @Body() dto: SetSettingDto): Promise<SettingResponseDto> {
    const tenantId = req.user.tenantId;
    return await this.settingsService.set(tenantId, dto.key, dto.value, {
      description: dto.description,
      isEncrypted: dto.isEncrypted,
      isEnabled: dto.isEnabled,
    });
  }

  @Delete(':key')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a setting (Admin only)' })
  @ApiResponse({ status: 200, description: 'Setting deleted' })
  async delete(@Request() req: any, @Param('key') key: string): Promise<{ message: string }> {
    const tenantId = req.user.tenantId;
    await this.settingsService.delete(tenantId, key);
    return { message: 'Setting deleted successfully' };
  }
}
