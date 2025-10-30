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
import { PageElement } from './page-element.entity';
import { PageBlock } from './page-block.entity';
import { TemplateCategory } from './template-category.entity';
import { TemplateReview } from './template-review.entity';
import { PagePopup } from './page-popup.entity';
import { MediaAsset } from './media-asset.entity';
import { PageForm, FormSubmission } from './page-form.entity';
import { PageTheme } from './page-theme.entity';
import { Contact } from '../crm/contact.entity';
import { User } from '../user/user.entity';
import { FunnelService } from './funnel.service';
import { PageService } from './page.service';
import { FunnelVariantService } from './services/funnel-variant.service';
import { FunnelAnalyticsService } from './services/funnel-analytics.service';
import { FunnelEnhancedService } from './services/funnel-enhanced.service';
import { PageBuilderService } from './services/page-builder.service';
import { TemplateLibraryService } from './services/template-library.service';
import { MediaLibraryService } from './services/media-library.service';
import { FormBuilderService } from './services/form-builder.service';
import { PopupBuilderService } from './services/popup-builder.service';
import { ThemeService } from './services/theme.service';
import { FunnelController } from './funnel.controller';
import { PageController } from './page.controller';
import { FunnelEnhancedController } from './controllers/funnel-enhanced.controller';
import { PageBuilderController } from './controllers/page-builder.controller';

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
      PageElement,
      PageBlock,
      TemplateCategory,
      TemplateReview,
      PagePopup,
      MediaAsset,
      PageForm,
      FormSubmission,
      PageTheme,
      Contact,
      User,
    ]),
  ],
  controllers: [
    FunnelController,
    PageController,
    FunnelEnhancedController,
    PageBuilderController,
  ],
  providers: [
    FunnelService,
    PageService,
    FunnelVariantService,
    FunnelAnalyticsService,
    FunnelEnhancedService,
    PageBuilderService,
    TemplateLibraryService,
    MediaLibraryService,
    FormBuilderService,
    PopupBuilderService,
    ThemeService,
  ],
  exports: [
    FunnelService,
    PageService,
    FunnelVariantService,
    FunnelAnalyticsService,
    FunnelEnhancedService,
    PageBuilderService,
    TemplateLibraryService,
    MediaLibraryService,
    FormBuilderService,
    PopupBuilderService,
    ThemeService,
  ],
})
export class FunnelModule {}
