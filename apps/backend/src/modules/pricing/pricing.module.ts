import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PricingRule } from './entities/pricing-rule.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { PriceHistory } from './entities/price-history.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PricingRule,
      TaxRate,
      PriceHistory,
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService, TypeOrmModule],
})
export class PricingModule {}