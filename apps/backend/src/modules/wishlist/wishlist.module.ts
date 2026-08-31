import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { ProductVariant } from '../catalogue/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wishlist,
      WishlistItem,
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService, TypeOrmModule],
})
export class WishlistModule {}