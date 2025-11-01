import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAutomationController } from './email-automation.controller';
import { EmailAutomationService } from './email-automation.service';
import { EmailSequence } from './email-sequence.entity';
import { EmailSequenceSubscriber } from './email-sequence-subscriber.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailSequence, EmailSequenceSubscriber]),
    AuditModule,
  ],
  controllers: [EmailAutomationController],
  providers: [EmailAutomationService],
  exports: [EmailAutomationService],
})
export class EmailAutomationModule {}
