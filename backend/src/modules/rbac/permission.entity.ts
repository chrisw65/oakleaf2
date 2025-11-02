import { Entity, Column, ManyToMany } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Role } from './role.entity';

/**
 * Permission entity for fine-grained access control
 * Examples: 'funnel:create', 'order:read', 'user:delete'
 */
@Entity('permissions')
export class Permission extends TenantBaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  resource: string; // e.g., 'funnel', 'order', 'user'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string; // Group permissions by category

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  /**
   * Check if permission matches a pattern
   * Examples:
   * - permission.matches('funnel:create') => exact match
   * - permission.matches('funnel:*') => all funnel permissions
   * - permission.matches('*:read') => all read permissions
   * - permission.matches('*:*') => all permissions
   */
  matches(pattern: string): boolean {
    const [patternResource, patternAction] = pattern.split(':');

    const resourceMatches = patternResource === '*' || patternResource === this.resource;
    const actionMatches = patternAction === '*' || patternAction === this.action;

    return resourceMatches && actionMatches;
  }

  /**
   * Get full permission name (resource:action)
   */
  get fullName(): string {
    return `${this.resource}:${this.action}`;
  }
}
