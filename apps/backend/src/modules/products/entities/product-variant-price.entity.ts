import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product_variant_prices')
export class ProductVariantPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'amount' })
  amount: string;

  @Column({ type: 'varchar', length: 50, name: 'price_type' })
  priceType: string;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'timestamp', name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'valid_until' })
  validUntil: Date;

  @ManyToOne(() => ProductVariant, variant => variant.prices)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid' })
  variantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}