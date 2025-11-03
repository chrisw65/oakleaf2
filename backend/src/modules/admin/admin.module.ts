import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminUsersService } from './admin-users.service';
import { CacheModule } from '../../common/cache/cache.module';
import { QueueModule } from '../../common/queue/queue.module';
import { User } from '../user/user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { Funnel } from '../funnel/funnel.entity';
import { Contact } from '../crm/contact.entity';
import { Order } from '../order/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Funnel, Contact, Order]),
    CacheModule,
    QueueModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminDashboardService, AdminUsersService],
  exports: [AdminService, AdminDashboardService, AdminUsersService],
})
export class AdminModule {}
