import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contact,
  Tag,
  CustomField,
  ContactCustomFieldValue,
  ContactActivity,
} from './contact.entity';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { Opportunity } from './opportunity.entity';
import { ContactService } from './services/contact.service';
import { TagService } from './services/tag.service';
import { CustomFieldService } from './services/custom-field.service';
import { PipelineService } from './services/pipeline.service';
import { OpportunityService } from './services/opportunity.service';
import { ContactController } from './controllers/contact.controller';
import { TagController } from './controllers/tag.controller';
import { CustomFieldController } from './controllers/custom-field.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { OpportunityController } from './controllers/opportunity.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
      Tag,
      CustomField,
      ContactCustomFieldValue,
      ContactActivity,
      Pipeline,
      PipelineStage,
      Opportunity,
    ]),
  ],
  controllers: [
    ContactController,
    TagController,
    CustomFieldController,
    PipelineController,
    OpportunityController,
  ],
  providers: [
    ContactService,
    TagService,
    CustomFieldService,
    PipelineService,
    OpportunityService,
  ],
  exports: [
    ContactService,
    TagService,
    CustomFieldService,
    PipelineService,
    OpportunityService,
  ],
})
export class CrmModule {}
