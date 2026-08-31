import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Cart } from '../cart/entities/cart.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';
import { Address } from '../customers/entities/address.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckoutSession,
      Cart,
      ProductVariant,
      Address,
      Order,
      Payment,
    ]),
    forwardRef(() => CartModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => OrdersModule),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService, TypeOrmModule],
})
export class CheckoutModule {}