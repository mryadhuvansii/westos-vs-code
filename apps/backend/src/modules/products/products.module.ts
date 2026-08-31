import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductVariantPrice } from './entities/product-variant-price.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Collection } from './entities/collection.entity';
import { Fabric } from './entities/fabric.entity';
import { Fit } from './entities/fit.entity';
import { Size } from './entities/size.entity';
import { Color } from './entities/color.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductMedia,
      ProductAttribute,
      ProductVariantPrice,
      Category,
      Brand,
      Collection,
      Fabric,
      Fit,
      Size,
      Color,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
