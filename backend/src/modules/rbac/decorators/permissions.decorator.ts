import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route
 * Can be used at controller or method level
 *
 * @example
 * // Require single permission
 * @RequirePermissions('funnel:create')
 * async createFunnel() { ... }
 *
 * // Require multiple permissions (user must have ALL)
 * @RequirePermissions('funnel:create', 'funnel:publish')
 * async publishFunnel() { ... }
 *
 * // Using wildcards
 * @RequirePermissions('funnel:*') // Any funnel permission
 * @RequirePermissions('*:read') // Any read permission
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require ANY of the specified permissions (OR logic)
 *
 * @example
 * @RequireAnyPermission('funnel:create', 'funnel:update')
 * async modifyFunnel() { ... }
 */
export const REQUIRE_ANY_PERMISSION_KEY = 'require_any_permission';
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);

/**
 * Decorator to check permission with dynamic resource ID
 * Useful for resource-level permissions
 *
 * @example
 * @RequireResourcePermission('funnel', 'update')
 * async updateFunnel(@Param('id') id: string) {
 *   // Will check if user has permission to update THIS specific funnel
 * }
 */
export const RESOURCE_PERMISSION_KEY = 'resource_permission';
export const RequireResourcePermission = (resource: string, action: string) =>
  SetMetadata(RESOURCE_PERMISSION_KEY, { resource, action });
export const Permissions = RequirePermissions;
