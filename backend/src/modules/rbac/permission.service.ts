import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
  isActive?: boolean;
}

/**
 * Default system permissions
 */
export const SYSTEM_PERMISSIONS = [
  // Funnel permissions
  { resource: 'funnel', action: 'create', description: 'Create funnels', category: 'Funnels' },
  { resource: 'funnel', action: 'read', description: 'View funnels', category: 'Funnels' },
  { resource: 'funnel', action: 'update', description: 'Edit funnels', category: 'Funnels' },
  { resource: 'funnel', action: 'delete', description: 'Delete funnels', category: 'Funnels' },
  { resource: 'funnel', action: 'publish', description: 'Publish funnels', category: 'Funnels' },

  // Page permissions
  { resource: 'page', action: 'create', description: 'Create pages', category: 'Pages' },
  { resource: 'page', action: 'read', description: 'View pages', category: 'Pages' },
  { resource: 'page', action: 'update', description: 'Edit pages', category: 'Pages' },
  { resource: 'page', action: 'delete', description: 'Delete pages', category: 'Pages' },

  // Product permissions
  { resource: 'product', action: 'create', description: 'Create products', category: 'Products' },
  { resource: 'product', action: 'read', description: 'View products', category: 'Products' },
  { resource: 'product', action: 'update', description: 'Edit products', category: 'Products' },
  { resource: 'product', action: 'delete', description: 'Delete products', category: 'Products' },

  // Order permissions
  { resource: 'order', action: 'read', description: 'View orders', category: 'Orders' },
  { resource: 'order', action: 'update', description: 'Update orders', category: 'Orders' },
  { resource: 'order', action: 'refund', description: 'Refund orders', category: 'Orders' },
  { resource: 'order', action: 'export', description: 'Export orders', category: 'Orders' },

  // Contact/CRM permissions
  { resource: 'contact', action: 'create', description: 'Create contacts', category: 'CRM' },
  { resource: 'contact', action: 'read', description: 'View contacts', category: 'CRM' },
  { resource: 'contact', action: 'update', description: 'Edit contacts', category: 'CRM' },
  { resource: 'contact', action: 'delete', description: 'Delete contacts', category: 'CRM' },
  { resource: 'contact', action: 'export', description: 'Export contacts', category: 'CRM' },

  // Email permissions
  { resource: 'email', action: 'create', description: 'Create email campaigns', category: 'Email' },
  { resource: 'email', action: 'read', description: 'View email campaigns', category: 'Email' },
  { resource: 'email', action: 'update', description: 'Edit email campaigns', category: 'Email' },
  { resource: 'email', action: 'delete', description: 'Delete email campaigns', category: 'Email' },
  { resource: 'email', action: 'send', description: 'Send emails', category: 'Email' },

  // Affiliate permissions
  { resource: 'affiliate', action: 'create', description: 'Create affiliates', category: 'Affiliates' },
  { resource: 'affiliate', action: 'read', description: 'View affiliates', category: 'Affiliates' },
  { resource: 'affiliate', action: 'update', description: 'Edit affiliates', category: 'Affiliates' },
  { resource: 'affiliate', action: 'delete', description: 'Delete affiliates', category: 'Affiliates' },
  { resource: 'affiliate', action: 'approve', description: 'Approve affiliates', category: 'Affiliates' },

  // User permissions
  { resource: 'user', action: 'create', description: 'Create users', category: 'Users' },
  { resource: 'user', action: 'read', description: 'View users', category: 'Users' },
  { resource: 'user', action: 'update', description: 'Edit users', category: 'Users' },
  { resource: 'user', action: 'delete', description: 'Delete users', category: 'Users' },

  // Role permissions
  { resource: 'role', action: 'create', description: 'Create roles', category: 'Roles' },
  { resource: 'role', action: 'read', description: 'View roles', category: 'Roles' },
  { resource: 'role', action: 'update', description: 'Edit roles', category: 'Roles' },
  { resource: 'role', action: 'delete', description: 'Delete roles', category: 'Roles' },
  { resource: 'role', action: 'assign', description: 'Assign roles to users', category: 'Roles' },

  // Webhook permissions
  { resource: 'webhook', action: 'create', description: 'Create webhooks', category: 'Webhooks' },
  { resource: 'webhook', action: 'read', description: 'View webhooks', category: 'Webhooks' },
  { resource: 'webhook', action: 'update', description: 'Edit webhooks', category: 'Webhooks' },
  { resource: 'webhook', action: 'delete', description: 'Delete webhooks', category: 'Webhooks' },

  // Analytics permissions
  { resource: 'analytics', action: 'read', description: 'View analytics', category: 'Analytics' },
  { resource: 'analytics', action: 'export', description: 'Export analytics', category: 'Analytics' },

  // Settings permissions
  { resource: 'settings', action: 'read', description: 'View settings', category: 'Settings' },
  { resource: 'settings', action: 'update', description: 'Update settings', category: 'Settings' },

  // Billing permissions
  { resource: 'billing', action: 'read', description: 'View billing', category: 'Billing' },
  { resource: 'billing', action: 'update', description: 'Update billing', category: 'Billing' },
];

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Create a new permission
   */
  async create(tenantId: string, dto: CreatePermissionDto): Promise<Permission> {
    const name = `${dto.resource}:${dto.action}`;
    const permission = this.permissionRepository.create({
      ...dto,
      name,
      tenantId,
    });
    return await this.permissionRepository.save(permission);
  }

  /**
   * Update permission
   */
  async update(
    tenantId: string,
    permissionId: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(tenantId, permissionId);

    if (dto.resource || dto.action) {
      permission.name = `${dto.resource || permission.resource}:${dto.action || permission.action}`;
    }

    Object.assign(permission, dto);
    return await this.permissionRepository.save(permission);
  }

  /**
   * Delete permission
   */
  async delete(tenantId: string, permissionId: string): Promise<void> {
    const permission = await this.findOne(tenantId, permissionId);
    await this.permissionRepository.remove(permission);
  }

  /**
   * Find one permission
   */
  async findOne(tenantId: string, permissionId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId, tenantId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  /**
   * Find permission by name
   */
  async findByName(tenantId: string, name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { name, tenantId },
    });
  }

  /**
   * Find all permissions for tenant
   */
  async findAll(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { tenantId },
      order: { category: 'ASC', resource: 'ASC', action: 'ASC' },
    });
  }

  /**
   * Find permissions by resource
   */
  async findByResource(tenantId: string, resource: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { tenantId, resource },
      order: { action: 'ASC' },
    });
  }

  /**
   * Find permissions by category
   */
  async findByCategory(tenantId: string, category: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { tenantId, category },
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  /**
   * Get all categories
   */
  async getCategories(tenantId: string): Promise<string[]> {
    const permissions = await this.findAll(tenantId);
    const categories = new Set(permissions.map((p) => p.category).filter((c): c is string => Boolean(c)));
    return Array.from(categories).sort();
  }

  /**
   * Initialize system permissions for a tenant
   */
  async initializeSystemPermissions(tenantId: string): Promise<Permission[]> {
    const existingPermissions = await this.findAll(tenantId);
    const existingNames = new Set(existingPermissions.map((p) => p.name));

    const newPermissions: Permission[] = [];

    for (const permData of SYSTEM_PERMISSIONS) {
      const name = `${permData.resource}:${permData.action}`;

      if (!existingNames.has(name)) {
        const permission = this.permissionRepository.create({
          name,
          tenantId,
          ...permData,
        });
        newPermissions.push(permission);
      }
    }

    if (newPermissions.length > 0) {
      await this.permissionRepository.save(newPermissions);
    }

    return newPermissions;
  }

  /**
   * Check if permission exists
   */
  async exists(tenantId: string, resource: string, action: string): Promise<boolean> {
    const name = `${resource}:${action}`;
    const count = await this.permissionRepository.count({
      where: { tenantId, name },
    });
    return count > 0;
  }

  /**
   * Bulk create permissions
   */
  async bulkCreate(
    tenantId: string,
    permissions: CreatePermissionDto[],
  ): Promise<Permission[]> {
    const entities = permissions.map((dto) =>
      this.permissionRepository.create({
        ...dto,
        name: `${dto.resource}:${dto.action}`,
        tenantId,
      }),
    );

    return await this.permissionRepository.save(entities);
  }
}
