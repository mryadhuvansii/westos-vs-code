import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { Campaign } from './entities/campaign.entity';
import { CampaignCoupon } from './entities/campaign-coupon.entity';
import { CustomerSegment } from './entities/customer-segment.entity';
import { SegmentRule } from './entities/segment-rule.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      CampaignCoupon,
      CustomerSegment,
      SegmentRule,
    ]),
    forwardRef(() => CouponsModule),
    forwardRef(() => CustomersModule),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService, TypeOrmModule],
})
export class MarketingModule {}