import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AUDIT_LOG_KEY, AuditOptions } from '../decorators/audit.decorator';
import { AuditSeverity } from '../audit-log.entity';

/**
 * Interceptor to automatically log actions based on @Audit decorator
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get audit options from decorator
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    // If no audit decorator, skip
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.tenantId || user?.tenantId;
    const userId = user?.id;

    // Skip if no user or tenant
    if (!userId || !tenantId) {
      return next.handle();
    }

    const startTime = Date.now();
    const args = context.getArgs();

    return next.handle().pipe(
      tap(async (result) => {
        const durationMs = Date.now() - startTime;

        try {
          // Extract resource ID
          let resourceId: string | undefined;
          if (auditOptions.getResourceId) {
            resourceId = auditOptions.getResourceId(args);
          } else if (result?.id) {
            resourceId = result.id;
          }

          // Extract metadata
          let metadata: Record<string, any> = {};
          if (auditOptions.getMetadata) {
            metadata = auditOptions.getMetadata(args, result);
          } else if (auditOptions.includeResult && result) {
            metadata = { result };
          }

          // Log the action
          await this.auditService.log(tenantId, {
            userId,
            action: auditOptions.action,
            resource: auditOptions.resource,
            resourceId,
            description: auditOptions.description,
            metadata,
            ipAddress: this.getIpAddress(request),
            userAgent: request.headers['user-agent'],
            requestId: request.id,
            sessionId: request.session?.id,
            method: request.method,
            endpoint: request.url,
            statusCode: 200,
            durationMs,
            isSuccess: true,
          });
        } catch (error) {
          this.logger.error(`Failed to log audit: ${error.message}`);
        }
      }),
      catchError((error) => {
        const durationMs = Date.now() - startTime;

        // Log error if not onlyOnSuccess
        if (!auditOptions.onlyOnSuccess) {
          this.auditService
            .log(tenantId, {
              userId,
              action: auditOptions.action,
              resource: auditOptions.resource,
              description: auditOptions.description,
              severity: AuditSeverity.ERROR,
              ipAddress: this.getIpAddress(request),
              userAgent: request.headers['user-agent'],
              requestId: request.id,
              sessionId: request.session?.id,
              method: request.method,
              endpoint: request.url,
              statusCode: error.status || 500,
              durationMs,
              isSuccess: false,
              errorMessage: error.message,
              stackTrace: error.stack,
            })
            .catch((auditError) => {
              this.logger.error(`Failed to log audit error: ${auditError.message}`);
            });
        }

        return throwError(() => error);
      }),
    );
  }

  /**
   * Get IP address from request
   */
  private getIpAddress(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip
    );
  }
}
