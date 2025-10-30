import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funnel } from './funnel.entity';
import { Page } from './page.entity';
import { FunnelTemplate } from './funnel-template.entity';
import { FunnelVariant } from './funnel-variant.entity';
import { FunnelSession } from './funnel-session.entity';
import { FunnelEvent } from './funnel-event.entity';
import { FunnelAnalytics } from './funnel-analytics.entity';
import { FunnelGoal } from './funnel-goal.entity';
import { FunnelCondition } from './funnel-condition.entity';
import { FunnelSuggestion } from './funnel-suggestion.entity';
import { Contact } from '../crm/contact.entity';
import { User } from '../user/user.entity';
import { FunnelService } from './funnel.service';
import { PageService } from './page.service';
import { FunnelVariantService } from './services/funnel-variant.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { FunnelEnhancedService } from './services/funnel-enhanced.service';
import { FunnelController } from './funnel.controller';
import { PageController } from './page.controller';
import { FunnelEnhancedController } from './controllers/funnel-enhanced.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Funnel,
      Page,
      FunnelTemplate,
      FunnelVariant,
      FunnelSession,
      FunnelEvent,
      FunnelAnalytics,
      FunnelGoal,
      FunnelCondition,
      FunnelSuggestion,
      Contact,
      User,
    ]),
  ],
  controllers: [FunnelController, PageController, FunnelEnhancedController],
  providers: [
    FunnelService,
    PageService,
    FunnelVariantService,
    FunnelAnalyticsService,
    FunnelEnhancedService,
  ],
  exports: [
    FunnelService,
    PageService,
    FunnelVariantService,
    FunnelAnalyticsService,
    FunnelEnhancedService,
  ],
})
export class FunnelModule {}
