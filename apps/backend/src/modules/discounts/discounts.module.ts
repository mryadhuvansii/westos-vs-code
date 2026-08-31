import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { Discount } from './entities/discount.entity';
import { Lot } from '../catalogue/entities/lot.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';
import { Combo } from '../catalogue/entities/combo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Discount,
      Lot,
      ProductVariant,
      Combo,
    ]),
    forwardRef(() => ProductsModule),
    forwardRef(() => PricingModule),
  ],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService, TypeOrmModule],
})
export class DiscountsModule {}