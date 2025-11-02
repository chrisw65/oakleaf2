import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CacheModule } from '../../common/cache/cache.module';
import { QueueModule } from '../../common/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    CacheModule,
    QueueModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
