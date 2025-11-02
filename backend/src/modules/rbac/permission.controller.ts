import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import type {
  CreatePermissionDto,
  UpdatePermissionDto,
} from './permission.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Create new permission
   */
  @Post()
  @RequirePermissions('role:create') // Same permission as role creation
  @ApiOperation({ summary: 'Create new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async create(@GetTenant() tenantId: string, @Body() dto: CreatePermissionDto) {
    const permission = await this.permissionService.create(tenantId, dto);
    return {
      success: true,
      data: permission,
      message: 'Permission created successfully',
    };
  }

  /**
   * Get all permissions
   */
  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of permissions' })
  async findAll(
    @GetTenant() tenantId: string,
    @Query('resource') resource?: string,
    @Query('category') category?: string,
  ) {
    let permissions;

    if (resource) {
      permissions = await this.permissionService.findByResource(tenantId, resource);
    } else if (category) {
      permissions = await this.permissionService.findByCategory(tenantId, category);
    } else {
      permissions = await this.permissionService.findAll(tenantId);
    }

    return {
      success: true,
      data: permissions,
      total: permissions.length,
    };
  }

  /**
   * Get permission categories
   */
  @Get('categories')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get permission categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(@GetTenant() tenantId: string) {
    const categories = await this.permissionService.getCategories(tenantId);
    return {
      success: true,
      data: categories,
    };
  }

  /**
   * Get permission by ID
   */
  @Get(':id')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission details' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const permission = await this.permissionService.findOne(tenantId, id);
    return {
      success: true,
      data: permission,
    };
  }

  /**
   * Update permission
   */
  @Put(':id')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async update(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionService.update(tenantId, id, dto);
    return {
      success: true,
      data: permission,
      message: 'Permission updated successfully',
    };
  }

  /**
   * Delete permission
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async delete(@GetTenant() tenantId: string, @Param('id') id: string) {
    await this.permissionService.delete(tenantId, id);
  }

  /**
   * Bulk create permissions
   */
  @Post('bulk')
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Bulk create permissions' })
  @ApiResponse({ status: 201, description: 'Permissions created successfully' })
  async bulkCreate(
    @GetTenant() tenantId: string,
    @Body() body: { permissions: CreatePermissionDto[] },
  ) {
    const permissions = await this.permissionService.bulkCreate(tenantId, body.permissions);
    return {
      success: true,
      data: permissions,
      message: `Created ${permissions.length} permissions`,
    };
  }

  /**
   * Initialize system permissions
   */
  @Post('initialize')
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Initialize system permissions for tenant' })
  @ApiResponse({ status: 200, description: 'System permissions initialized' })
  async initializeSystemPermissions(@GetTenant() tenantId: string) {
    const permissions = await this.permissionService.initializeSystemPermissions(tenantId);
    return {
      success: true,
      data: permissions,
      message: `Initialized ${permissions.length} system permissions`,
    };
  }
}
