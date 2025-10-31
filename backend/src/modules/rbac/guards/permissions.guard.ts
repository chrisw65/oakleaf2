import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, REQUIRE_ANY_PERMISSION_KEY } from '../decorators/permissions.decorator';

/**
 * Guard to check if user has required permissions
 * Works with @RequirePermissions and @RequireAnyPermission decorators
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator (check both method and class)
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredAnyPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions && !requiredAnyPermissions) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has role with permissions
    if (!user.role || !user.role.permissions) {
      throw new ForbiddenException('User has no role or permissions');
    }

    // Check RequirePermissions (ALL must match)
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every((required) =>
        this.hasPermission(user.role.permissions, required),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Missing required permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    // Check RequireAnyPermission (ANY must match)
    if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
      const hasAnyPermission = requiredAnyPermissions.some((required) =>
        this.hasPermission(user.role.permissions, required),
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Missing at least one of: ${requiredAnyPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }

  /**
   * Check if user has a specific permission
   * Supports wildcard patterns
   */
  private hasPermission(userPermissions: any[], requiredPermission: string): boolean {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Check for exact match or pattern match
    return userPermissions.some((permission) => {
      const permissionName = permission.fullName || permission.name;
      return this.matchesPermission(permissionName, requiredPermission);
    });
  }

  /**
   * Check if permission matches pattern
   * Supports wildcards: 'funnel:*', '*:read', '*:*'
   */
  private matchesPermission(userPermission: string, requiredPermission: string): boolean {
    // Exact match
    if (userPermission === requiredPermission) {
      return true;
    }

    // User has all permissions
    if (userPermission === '*:*') {
      return true;
    }

    const [userResource, userAction] = userPermission.split(':');
    const [requiredResource, requiredAction] = requiredPermission.split(':');

    // Check resource match
    const resourceMatches = userResource === '*' || userResource === requiredResource;

    // Check action match
    const actionMatches = userAction === '*' || userAction === requiredAction;

    return resourceMatches && actionMatches;
  }
}
