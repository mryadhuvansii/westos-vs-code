import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SerializationService } from './serialization.service';
import { SerializationController } from './serialization.controller';
import { SerializedProduct } from './entities/serialized-product.entity';
import { SaleRecord } from './entities/sale-record.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';
import { Lot } from '../catalogue/entities/lot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SerializedProduct,
      SaleRecord,
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [SerializationController],
  providers: [SerializationService],
  exports: [SerializationService, TypeOrmModule],
})
export class SerializationModule {}