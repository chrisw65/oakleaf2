import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog } from './audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { CacheModule } from '../../common/cache/cache.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), CacheModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditInterceptor,
    // Register as global interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
