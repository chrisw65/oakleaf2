import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../audit-log.entity';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditOptions {
  action: AuditAction;
  resource: string;
  getResourceId?: (args: any[]) => string; // Function to extract resource ID from args
  getMetadata?: (args: any[], result?: any) => Record<string, any>; // Function to extract metadata
  description?: string;
  includeResult?: boolean; // Include method result in metadata
  onlyOnSuccess?: boolean; // Only log if method succeeds
}

/**
 * Decorator to automatically log actions
 *
 * @example
 * @Audit({
 *   action: AuditAction.CREATE,
 *   resource: 'funnel',
 *   getResourceId: (args) => args[1]?.id, // Get funnel ID from second argument
 *   description: 'Created new funnel',
 * })
 * async createFunnel(tenantId: string, dto: CreateFunnelDto) { ... }
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_LOG_KEY, options);

/**
 * Decorator to audit CREATE operations
 */
export const AuditCreate = (resource: string, getResourceId?: (args: any[]) => string) =>
  Audit({
    action: AuditAction.CREATE,
    resource,
    getResourceId,
    includeResult: true,
  });

/**
 * Decorator to audit UPDATE operations
 */
export const AuditUpdate = (resource: string, getResourceId?: (args: any[]) => string) =>
  Audit({
    action: AuditAction.UPDATE,
    resource,
    getResourceId,
  });

/**
 * Decorator to audit DELETE operations
 */
export const AuditDelete = (resource: string, getResourceId?: (args: any[]) => string) =>
  Audit({
    action: AuditAction.DELETE,
    resource,
    getResourceId,
  });

/**
 * Decorator to audit READ operations (useful for sensitive data)
 */
export const AuditRead = (resource: string, getResourceId?: (args: any[]) => string) =>
  Audit({
    action: AuditAction.READ,
    resource,
    getResourceId,
    onlyOnSuccess: true,
  });
