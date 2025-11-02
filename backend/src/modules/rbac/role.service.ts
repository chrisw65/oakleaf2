import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RoleType } from './role.entity';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';

export interface CreateRoleDto {
  name: string;
  description?: string;
  type?: RoleType;
  priority?: number;
  permissionIds?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  isActive?: boolean;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

/**
 * Default system roles with their permissions
 */
export const SYSTEM_ROLES = {
  owner: {
    name: 'Owner',
    description: 'Full access to all resources',
    type: RoleType.SYSTEM,
    priority: 100,
    permissions: ['*:*'], // All permissions
    metadata: { color: '#ef4444', icon: 'crown' },
  },
  admin: {
    name: 'Admin',
    description: 'Administrative access with some restrictions',
    type: RoleType.SYSTEM,
    priority: 80,
    permissions: [
      'funnel:*',
      'page:*',
      'product:*',
      'order:*',
      'contact:*',
      'email:*',
      'affiliate:*',
      'webhook:*',
      'analytics:*',
      'user:read',
      'user:update',
      'role:read',
    ],
    metadata: { color: '#f97316', icon: 'shield' },
  },
  manager: {
    name: 'Manager',
    description: 'Can manage content and view reports',
    type: RoleType.SYSTEM,
    priority: 60,
    permissions: [
      'funnel:create',
      'funnel:read',
      'funnel:update',
      'page:*',
      'product:read',
      'product:update',
      'order:read',
      'order:update',
      'contact:*',
      'email:*',
      'analytics:read',
    ],
    metadata: { color: '#8b5cf6', icon: 'briefcase' },
  },
  editor: {
    name: 'Editor',
    description: 'Can create and edit content',
    type: RoleType.SYSTEM,
    priority: 40,
    permissions: [
      'funnel:read',
      'funnel:update',
      'page:create',
      'page:read',
      'page:update',
      'product:read',
      'contact:read',
      'email:read',
    ],
    metadata: { color: '#06b6d4', icon: 'edit' },
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to most resources',
    type: RoleType.SYSTEM,
    priority: 20,
    permissions: [
      'funnel:read',
      'page:read',
      'product:read',
      'order:read',
      'contact:read',
      'email:read',
      'analytics:read',
    ],
    metadata: { color: '#10b981', icon: 'eye' },
  },
};

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Create a new role
   */
  async create(tenantId: string, userId: string, dto: CreateRoleDto): Promise<Role> {
    // Load permissions if specified
    let permissions: Permission[] = [];
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.find({
        where: {
          id: In(dto.permissionIds),
          tenantId,
        },
      });

      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Some permissions not found');
      }
    }

    const role = this.roleRepository.create({
      ...dto,
      tenantId,
      permissions,
    });

    return await this.roleRepository.save(role);
  }

  /**
   * Update role
   */
  async update(tenantId: string, roleId: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(tenantId, roleId);

    // Prevent modification of system roles
    if (role.type === RoleType.SYSTEM && dto.type !== RoleType.SYSTEM) {
      throw new BadRequestException('Cannot modify system role type');
    }

    // Update permissions if specified
    if (dto.permissionIds) {
      const permissions = await this.permissionRepository.find({
        where: {
          id: In(dto.permissionIds),
          tenantId,
        },
      });

      if (permissions.length !== dto.permissionIds.length) {
        throw new BadRequestException('Some permissions not found');
      }

      role.permissions = permissions;
    }

    Object.assign(role, dto);
    return await this.roleRepository.save(role);
  }

  /**
   * Delete role
   */
  async delete(tenantId: string, roleId: string): Promise<void> {
    const role = await this.findOne(tenantId, roleId);

    // Prevent deletion of system roles
    if (role.type === RoleType.SYSTEM) {
      throw new BadRequestException('Cannot delete system role');
    }

    // Check if role is in use
    const usersCount = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .where('role.id = :roleId', { roleId })
      .andWhere('role.tenantId = :tenantId', { tenantId })
      .getCount();

    if (usersCount > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Find one role
   */
  async findOne(tenantId: string, roleId: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, tenantId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Find role by name
   */
  async findByName(tenantId: string, name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name, tenantId },
      relations: ['permissions'],
    });
  }

  /**
   * Find all roles for tenant
   */
  async findAll(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { tenantId },
      relations: ['permissions'],
      order: { priority: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Find system roles
   */
  async findSystemRoles(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { tenantId, type: RoleType.SYSTEM },
      relations: ['permissions'],
      order: { priority: 'DESC' },
    });
  }

  /**
   * Find custom roles
   */
  async findCustomRoles(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { tenantId, type: RoleType.CUSTOM },
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.findOne(tenantId, roleId);

    const permissions = await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
        tenantId,
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    role.permissions = permissions;
    return await this.roleRepository.save(role);
  }

  /**
   * Add permissions to role
   */
  async addPermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.findOne(tenantId, roleId);

    const newPermissions = await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
        tenantId,
      },
    });

    if (newPermissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    // Merge existing and new permissions (avoid duplicates)
    const existingIds = new Set(role.permissions.map((p) => p.id));
    const toAdd = newPermissions.filter((p) => !existingIds.has(p.id));

    role.permissions = [...role.permissions, ...toAdd];
    return await this.roleRepository.save(role);
  }

  /**
   * Remove permissions from role
   */
  async removePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.findOne(tenantId, roleId);

    const idsToRemove = new Set(permissionIds);
    role.permissions = role.permissions.filter((p) => !idsToRemove.has(p.id));

    return await this.roleRepository.save(role);
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(
    tenantId: string,
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    // This would typically involve loading the user's role
    // For now, returning a placeholder
    // Implementation would depend on User entity having a role relation
    return false;
  }

  /**
   * Initialize system roles for a tenant
   */
  async initializeSystemRoles(tenantId: string): Promise<Role[]> {
    const existingRoles = await this.findSystemRoles(tenantId);
    const existingNames = new Set(existingRoles.map((r) => r.name));

    const newRoles: Role[] = [];

    for (const [key, roleData] of Object.entries(SYSTEM_ROLES)) {
      if (!existingNames.has(roleData.name)) {
        // Find or create permissions based on patterns
        const permissions = await this.resolvePermissionPatterns(
          tenantId,
          roleData.permissions,
        );

        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          type: roleData.type,
          priority: roleData.priority,
          metadata: roleData.metadata,
          tenantId,
          permissions,
        });

        newRoles.push(role);
      }
    }

    if (newRoles.length > 0) {
      await this.roleRepository.save(newRoles);
    }

    return newRoles;
  }

  /**
   * Resolve permission patterns (e.g., 'funnel:*', '*:read')
   */
  private async resolvePermissionPatterns(
    tenantId: string,
    patterns: string[],
  ): Promise<Permission[]> {
    const allPermissions = await this.permissionService.findAll(tenantId);

    if (patterns.includes('*:*')) {
      return allPermissions;
    }

    const matchingPermissions: Permission[] = [];

    for (const pattern of patterns) {
      for (const permission of allPermissions) {
        if (permission.matches(pattern)) {
          matchingPermissions.push(permission);
        }
      }
    }

    // Remove duplicates
    const uniquePermissions = Array.from(
      new Map(matchingPermissions.map((p) => [p.id, p])).values(),
    );

    return uniquePermissions;
  }

  /**
   * Get role statistics
   */
  async getRoleStats(tenantId: string, roleId: string): Promise<any> {
    const role = await this.findOne(tenantId, roleId);

    const usersCount = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .where('role.id = :roleId', { roleId })
      .andWhere('role.tenantId = :tenantId', { tenantId })
      .getCount();

    return {
      id: role.id,
      name: role.name,
      type: role.type,
      usersCount,
      permissionsCount: role.permissions.length,
      isActive: role.isActive,
    };
  }

  /**
   * Clone role
   */
  async cloneRole(
    tenantId: string,
    roleId: string,
    newName: string,
  ): Promise<Role> {
    const sourceRole = await this.findOne(tenantId, roleId);

    const clonedRole = this.roleRepository.create({
      name: newName,
      description: `Cloned from ${sourceRole.name}`,
      type: RoleType.CUSTOM, // Always create as custom role
      priority: sourceRole.priority,
      metadata: { ...sourceRole.metadata },
      tenantId,
      permissions: sourceRole.permissions,
    });

    return await this.roleRepository.save(clonedRole);
  }
}
