import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeyService, CreateApiKeyDto, UpdateApiKeyDto } from './api-key.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('api-keys')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Create new API key
   */
  @Post()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Create new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    const result = await this.apiKeyService.create(tenantId, userId, dto);

    return {
      success: true,
      data: {
        apiKey: result.apiKey,
        plainKey: result.plainKey,
      },
      message: 'API key created successfully. Save the key securely - it will not be shown again!',
    };
  }

  /**
   * Get all API keys
   */
  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async findAll(@GetTenant() tenantId: string) {
    const apiKeys = await this.apiKeyService.findAll(tenantId);

    // Don't return the actual key
    const sanitized = apiKeys.map(key => ({
      ...key,
      key: undefined,
    }));

    return {
      success: true,
      data: sanitized,
      total: sanitized.length,
    };
  }

  /**
   * Get API key by ID
   */
  @Get(':id')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get API key by ID' })
  @ApiResponse({ status: 200, description: 'API key details' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const apiKey = await this.apiKeyService.findOne(tenantId, id);

    return {
      success: true,
      data: {
        ...apiKey,
        key: undefined, // Never return the actual key
      },
    };
  }

  /**
   * Update API key
   */
  @Put(':id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update API key' })
  @ApiResponse({ status: 200, description: 'API key updated successfully' })
  async update(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApiKeyDto,
  ) {
    const apiKey = await this.apiKeyService.update(tenantId, userId, id, dto);

    return {
      success: true,
      data: {
        ...apiKey,
        key: undefined,
      },
      message: 'API key updated successfully',
    };
  }

  /**
   * Revoke API key
   */
  @Post(':id/revoke')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  async revoke(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    await this.apiKeyService.revoke(tenantId, userId, id, body.reason);

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  }

  /**
   * Delete API key
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('settings:delete')
  @ApiOperation({ summary: 'Delete API key' })
  @ApiResponse({ status: 204, description: 'API key deleted successfully' })
  async delete(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('id') id: string,
  ) {
    await this.apiKeyService.delete(tenantId, userId, id);
  }

  /**
   * Get API key statistics
   */
  @Get(':id/stats')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get API key statistics' })
  @ApiResponse({ status: 200, description: 'API key statistics' })
  async getStats(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.apiKeyService.getStats(tenantId, id);

    return {
      success: true,
      data: stats,
    };
  }
}
