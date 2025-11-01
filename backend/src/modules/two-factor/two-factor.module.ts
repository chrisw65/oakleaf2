import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorAuth } from './two-factor.entity';
import { AuditModule } from '../audit/audit.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TwoFactorAuth]), AuditModule],
  controllers: [TwoFactorController],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
