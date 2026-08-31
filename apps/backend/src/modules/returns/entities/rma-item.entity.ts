import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RMARequest } from './rma-request.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('rma_items')
export class RMAItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  refundAmount: string;

  @ManyToOne(() => RMARequest, request => request.items)
  @JoinColumn({ name: 'rma_request_id' })
  rmaRequest: RMARequest;

  @Column({ type: 'uuid' })
  rmaRequestId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid' })
  variantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}