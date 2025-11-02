import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Permission } from './permission.entity';
import { User } from '../user/user.entity';

export enum RoleType {
  SYSTEM = 'system', // Built-in system roles (cannot be deleted)
  CUSTOM = 'custom', // User-created custom roles
}

/**
 * Role entity for role-based access control
 * Supports both system roles (owner, admin, user) and custom roles
 */
@Entity('roles')
export class Role extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number; // Higher priority = more powerful (for role hierarchy)

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    color?: string; // UI color for role badge
    icon?: string; // UI icon for role
    maxUsers?: number; // Limit number of users with this role
    [key: string]: any;
  };

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  /**
   * Check if role has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    if (!this.permissions || this.permissions.length === 0) {
      return false;
    }

    return this.permissions.some(
      (p) => p.fullName === permissionName || p.matches(permissionName),
    );
  }

  /**
   * Check if role has any of the specified permissions
   */
  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some((name) => this.hasPermission(name));
  }

  /**
   * Check if role has all of the specified permissions
   */
  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every((name) => this.hasPermission(name));
  }

  /**
   * Get all permission names for this role
   */
  getPermissionNames(): string[] {
    if (!this.permissions) {
      return [];
    }
    return this.permissions.map((p) => p.fullName);
  }
}
