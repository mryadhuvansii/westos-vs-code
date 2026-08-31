import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { Size } from './size.entity';
import { Color } from './color.entity';
import { ProductVariantPrice } from './product-variant-price.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'mrp' })
  mrp: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'selling_price' })
  sellingPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, name: 'cost_price' })
  costPrice: string;

  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  weight: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Size, size => size.variants)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @Column({ type: 'uuid', nullable: true, name: 'size_id' })
  sizeId: string;

  @ManyToOne(() => Color, color => color.variants)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @Column({ type: 'uuid', nullable: true, name: 'color_id' })
  colorId: string;

  @OneToMany(() => ProductVariantPrice, price => price.variant)
  prices: ProductVariantPrice[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}