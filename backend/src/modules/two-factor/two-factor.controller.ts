import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TwoFactorService, Setup2FADto, Enable2FADto } from './two-factor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Two-Factor Authentication')
@ApiBearerAuth()
@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  /**
   * Setup 2FA (generate secret and QR code)
   */
  @Post('setup')
  @ApiOperation({ summary: 'Setup 2FA for user' })
  @ApiResponse({ status: 201, description: '2FA setup completed' })
  async setup(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: Setup2FADto,
  ) {
    const result = await this.twoFactorService.setup(tenantId, userId, {
      ...dto,
      userId,
    });

    return {
      success: true,
      data: result,
      message: 'Scan the QR code with your authenticator app and save the backup codes',
    };
  }

  /**
   * Enable 2FA after verification
   */
  @Post('enable')
  @ApiOperation({ summary: 'Enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: Enable2FADto,
  ) {
    await this.twoFactorService.enable(tenantId, userId, dto);

    return {
      success: true,
      message: '2FA has been enabled successfully',
    };
  }

  /**
   * Disable 2FA
   */
  @Delete('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() body: { token: string },
  ) {
    await this.twoFactorService.disable(tenantId, userId, body.token);

    return {
      success: true,
      message: '2FA has been disabled',
    };
  }

  /**
   * Verify 2FA token
   */
  @Post('verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  @ApiResponse({ status: 200, description: 'Token verification result' })
  async verify(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() body: { token: string },
  ) {
    const isValid = await this.twoFactorService.verifyToken(tenantId, userId, body.token);

    return {
      success: true,
      data: { valid: isValid },
    };
  }

  /**
   * Get 2FA status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get 2FA status' })
  @ApiResponse({ status: 200, description: '2FA status' })
  async getStatus(@GetTenant() tenantId: string, @GetUser() userId: string) {
    const status = await this.twoFactorService.getStatus(tenantId, userId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * Regenerate backup codes
   */
  @Post('backup-codes/regenerate')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated' })
  async regenerateBackupCodes(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() body: { token: string },
  ) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodes(
      tenantId,
      userId,
      body.token,
    );

    return {
      success: true,
      data: { backupCodes },
      message: 'New backup codes generated. Save them securely!',
    };
  }
}
