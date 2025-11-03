import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import { getDatabaseConfig } from './config/database.config';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FunnelModule } from './modules/funnel/funnel.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { CrmModule } from './modules/crm/crm.module';
import { OrderModule } from './modules/order/order.module';
import { EmailModule } from './modules/email/email.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AuditModule } from './modules/audit/audit.module';
import { PaymentModule } from './modules/payment/payment.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { TwoFactorModule } from './modules/two-factor/two-factor.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { CustomDomainModule } from './modules/custom-domain/custom-domain.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ABTestingModule } from './modules/ab-testing/ab-testing.module';
import { EmailTemplateModule } from './modules/email-template/email-template.module';
import { EmailAutomationModule } from './modules/email-automation/email-automation.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AIModule } from './modules/ai/ai.module';
import { CacheModule } from './common/cache/cache.module';
import { QueueModule } from './common/queue/queue.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env', '.env.local'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Infrastructure Modules
    CacheModule,
    QueueModule,
    RbacModule,
    AuditModule,
    FileUploadModule,
    NotificationModule,
    AdminModule,
    TwoFactorModule,
    ApiKeyModule,
    CustomDomainModule,
    AnalyticsModule,
    ABTestingModule,
    EmailTemplateModule,
    EmailAutomationModule,
    SettingsModule,
    AIModule,

    // Feature Modules
    TenantModule,
    UserModule,
    AuthModule,
    FunnelModule,
    AffiliateModule,
    CrmModule,
    OrderModule,
    EmailModule,
    WebhookModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
