import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Refund, PaymentWebhook]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
