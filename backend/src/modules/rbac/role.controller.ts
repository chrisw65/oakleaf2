import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoleService, CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './role.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { RequirePermissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create new role
   */
  @Post()
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateRoleDto,
  ) {
    const role = await this.roleService.create(tenantId, userId, dto);
    return {
      success: true,
      data: role,
      message: 'Role created successfully',
    };
  }

  /**
   * Get all roles
   */
  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findAll(@GetTenant() tenantId: string) {
    const roles = await this.roleService.findAll(tenantId);
    return {
      success: true,
      data: roles,
      total: roles.length,
    };
  }

  /**
   * Get system roles
   */
  @Get('system')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get system roles' })
  @ApiResponse({ status: 200, description: 'List of system roles' })
  async findSystemRoles(@GetTenant() tenantId: string) {
    const roles = await this.roleService.findSystemRoles(tenantId);
    return {
      success: true,
      data: roles,
    };
  }

  /**
   * Get custom roles
   */
  @Get('custom')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get custom roles' })
  @ApiResponse({ status: 200, description: 'List of custom roles' })
  async findCustomRoles(@GetTenant() tenantId: string) {
    const roles = await this.roleService.findCustomRoles(tenantId);
    return {
      success: true,
      data: roles,
    };
  }

  /**
   * Get role by ID
   */
  @Get(':id')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role details' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@GetTenant() tenantId: string, @Param('id') id: string) {
    const role = await this.roleService.findOne(tenantId, id);
    return {
      success: true,
      data: role,
    };
  }

  /**
   * Update role
   */
  @Put(':id')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.roleService.update(tenantId, id, dto);
    return {
      success: true,
      data: role,
      message: 'Role updated successfully',
    };
  }

  /**
   * Delete role
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async delete(@GetTenant() tenantId: string, @Param('id') id: string) {
    await this.roleService.delete(tenantId, id);
  }

  /**
   * Assign permissions to role
   */
  @Post(':id/permissions')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  async assignPermissions(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    const role = await this.roleService.assignPermissions(tenantId, id, dto.permissionIds);
    return {
      success: true,
      data: role,
      message: 'Permissions assigned successfully',
    };
  }

  /**
   * Add permissions to role
   */
  @Post(':id/permissions/add')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Add permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions added successfully' })
  async addPermissions(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    const role = await this.roleService.addPermissions(tenantId, id, dto.permissionIds);
    return {
      success: true,
      data: role,
      message: 'Permissions added successfully',
    };
  }

  /**
   * Remove permissions from role
   */
  @Post(':id/permissions/remove')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully' })
  async removePermissions(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    const role = await this.roleService.removePermissions(tenantId, id, dto.permissionIds);
    return {
      success: true,
      data: role,
      message: 'Permissions removed successfully',
    };
  }

  /**
   * Get role statistics
   */
  @Get(':id/stats')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get role statistics' })
  @ApiResponse({ status: 200, description: 'Role statistics' })
  async getStats(@GetTenant() tenantId: string, @Param('id') id: string) {
    const stats = await this.roleService.getRoleStats(tenantId, id);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Clone role
   */
  @Post(':id/clone')
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Clone role' })
  @ApiResponse({ status: 201, description: 'Role cloned successfully' })
  async clone(
    @GetTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    const role = await this.roleService.cloneRole(tenantId, id, body.name);
    return {
      success: true,
      data: role,
      message: 'Role cloned successfully',
    };
  }

  /**
   * Initialize system roles
   */
  @Post('initialize')
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Initialize system roles for tenant' })
  @ApiResponse({ status: 200, description: 'System roles initialized' })
  async initializeSystemRoles(@GetTenant() tenantId: string) {
    const roles = await this.roleService.initializeSystemRoles(tenantId);
    return {
      success: true,
      data: roles,
      message: `Initialized ${roles.length} system roles`,
    };
  }
}
