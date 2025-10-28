import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EmailTemplate } from './email-template.entity';
import { EmailCampaign } from './email-campaign.entity';
import { EmailSequence } from './email-sequence.entity';
import { EmailSequenceStep } from './email-sequence-step.entity';
import { EmailSequenceSubscriber } from './email-sequence-subscriber.entity';
import { EmailLog } from './email-log.entity';
import { AutomationRule } from './automation-rule.entity';
import { Segment } from './segment.entity';
import { Contact } from '../crm/contact.entity';
import { User } from '../user/user.entity';

// Services
import { EmailTemplateService } from './services/email-template.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { EmailSequenceService } from './services/email-sequence.service';
import { AutomationRuleService } from './services/automation-rule.service';
import { SegmentService } from './services/segment.service';

// Controllers
import { EmailTemplateController } from './controllers/email-template.controller';
import { EmailCampaignController } from './controllers/email-campaign.controller';
import { EmailSequenceController } from './controllers/email-sequence.controller';
import { AutomationRuleController } from './controllers/automation-rule.controller';
import { SegmentController } from './controllers/segment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplate,
      EmailCampaign,
      EmailSequence,
      EmailSequenceStep,
      EmailSequenceSubscriber,
      EmailLog,
      AutomationRule,
      Segment,
      Contact,
      User,
    ]),
  ],
  controllers: [
    EmailTemplateController,
    EmailCampaignController,
    EmailSequenceController,
    AutomationRuleController,
    SegmentController,
  ],
  providers: [
    EmailTemplateService,
    EmailCampaignService,
    EmailSequenceService,
    AutomationRuleService,
    SegmentService,
  ],
  exports: [
    EmailTemplateService,
    EmailCampaignService,
    EmailSequenceService,
    AutomationRuleService,
    SegmentService,
  ],
})
export class EmailModule {}
