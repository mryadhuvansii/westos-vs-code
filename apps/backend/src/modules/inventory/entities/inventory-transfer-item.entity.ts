import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryTransfer } from './inventory-transfer.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('inventory_transfer_items')
export class InventoryTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  receivedQuantity: number;

  @ManyToOne(() => InventoryTransfer, transfer => transfer.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer: InventoryTransfer;

  @Column({ type: 'uuid' })
  transferId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'uuid' })
  variantId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}