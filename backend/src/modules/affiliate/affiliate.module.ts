import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './affiliate.entity';
import { AffiliateClick } from './affiliate-click.entity';
import { Commission } from './commission.entity';
import { CommissionPlan } from './commission-plan.entity';
import { Payout } from './payout.entity';
import { AffiliateService } from './services/affiliate.service';
import { AffiliateTrackingService } from './services/affiliate-tracking.service';
import { CommissionService } from './services/commission.service';
import { PayoutService } from './services/payout.service';
import { AffiliateController } from './controllers/affiliate.controller';
import { CommissionController } from './controllers/commission.controller';
import { PayoutController } from './controllers/payout.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Affiliate,
      AffiliateClick,
      Commission,
      CommissionPlan,
      Payout,
    ]),
  ],
  controllers: [
    AffiliateController,
    CommissionController,
    PayoutController,
  ],
  providers: [
    AffiliateService,
    AffiliateTrackingService,
    CommissionService,
    PayoutService,
  ],
  exports: [
    AffiliateService,
    AffiliateTrackingService,
    CommissionService,
    PayoutService,
  ],
})
export class AffiliateModule {}
