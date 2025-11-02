import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomDomainController } from './custom-domain.controller';
import { CustomDomainService } from './custom-domain.service';
import { CustomDomain } from './custom-domain.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomDomain]), AuditModule],
  controllers: [CustomDomainController],
  providers: [CustomDomainService],
  exports: [CustomDomainService],
})
export class CustomDomainModule {}
