import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { Refund } from './entities/refund.entity';
import { RefundApproval } from './entities/refund-approval.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ReturnRequest } from '../returns/entities/return-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Refund,
      RefundApproval,
    ]),
    forwardRef(() => PaymentsModule),
    forwardRef(() => ReturnsModule),
  ],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService, TypeOrmModule],
})
export class RefundsModule {}