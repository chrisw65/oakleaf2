import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ABTestingController } from './ab-testing.controller';
import { ABTestingService } from './ab-testing.service';
import { ABTest } from './ab-test.entity';
import { ABTestParticipant } from './ab-test-participant.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ABTest, ABTestParticipant]),
    AuditModule,
  ],
  controllers: [ABTestingController],
  providers: [ABTestingService],
  exports: [ABTestingService],
})
export class ABTestingModule {}
