import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Coupon } from './entities/coupon.entity';
import { Campaign } from '../marketing/entities/campaign.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon,
      Campaign,
    ]),
    forwardRef(() => MarketingModule),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService, TypeOrmModule],
})
export class CouponsModule {}