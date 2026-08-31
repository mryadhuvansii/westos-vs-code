import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Invoice } from './entities/invoice.entity';
import { CreditNote } from './entities/credit-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, CreditNote])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
