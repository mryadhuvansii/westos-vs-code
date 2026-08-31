import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Category } from '../products/entities/category.entity';
import { Brand } from '../products/entities/brand.entity';
import { Collection } from '../products/entities/collection.entity';
import { Fabric } from '../products/entities/fabric.entity';
import { Fit } from '../products/entities/fit.entity';
import { Size } from '../products/entities/size.entity';
import { Color } from '../products/entities/color.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { ProductAttribute } from '../products/entities/product-attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      Category,
      Brand,
      Collection,
      Fabric,
      Fit,
      Size,
      Color,
      ProductMedia,
      ProductAttribute,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CatalogueModule {}