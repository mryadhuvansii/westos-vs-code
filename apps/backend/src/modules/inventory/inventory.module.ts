import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StockReservation } from './entities/stock-reservation.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, PurchaseOrder, StockReservation, ProductVariant]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
