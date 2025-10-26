import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funnel } from './funnel.entity';
import { Page } from './page.entity';
import { FunnelTemplate } from './funnel-template.entity';
import { FunnelService } from './funnel.service';
import { PageService } from './page.service';
import { FunnelController } from './funnel.controller';
import { PageController } from './page.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Funnel, Page, FunnelTemplate])],
  controllers: [FunnelController, PageController],
  providers: [FunnelService, PageService],
  exports: [FunnelService, PageService],
})
export class FunnelModule {}
