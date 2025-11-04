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
import { Note } from './note.entity';
import { Task } from './task.entity';
import { SavedFilter } from './saved-filter.entity';
import { ContactService } from './services/contact.service';
import { ContactActivityService } from './services/contact-activity.service';
import { NoteService } from './services/note.service';
import { TaskService } from './services/task.service';
import { TagService } from './services/tag.service';
import { CustomFieldService } from './services/custom-field.service';
import { PipelineService } from './services/pipeline.service';
import { OpportunityService } from './services/opportunity.service';
import { AnalyticsService } from './services/analytics.service';
import { FilterService } from './services/filter.service';
import { ContactController } from './controllers/contact.controller';
import { TagController } from './controllers/tag.controller';
import { CustomFieldController } from './controllers/custom-field.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { OpportunityController } from './controllers/opportunity.controller';
import { TaskController } from './controllers/task.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { FilterController } from './controllers/filter.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
      Tag,
      CustomField,
      ContactCustomFieldValue,
      ContactActivity,
      Note,
      Task,
      Pipeline,
      PipelineStage,
      Opportunity,
      SavedFilter,
    ]),
  ],
  controllers: [
    ContactController,
    TagController,
    CustomFieldController,
    PipelineController,
    OpportunityController,
    TaskController,
    AnalyticsController,
    FilterController,
  ],
  providers: [
    ContactService,
    ContactActivityService,
    NoteService,
    TaskService,
    TagService,
    CustomFieldService,
    PipelineService,
    OpportunityService,
    AnalyticsService,
    FilterService,
  ],
  exports: [
    ContactService,
    ContactActivityService,
    NoteService,
    TaskService,
    TagService,
    CustomFieldService,
    PipelineService,
    OpportunityService,
  ],
})
export class CrmModule {}
