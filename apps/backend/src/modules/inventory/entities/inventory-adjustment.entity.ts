import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inventory } from './inventory.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

export enum AdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  SET = 'set',
}

export enum AdjustmentReason {
  DAMAGED = 'damaged',
  LOST = 'lost',
  EXPIRED = 'expired',
  QUALITY_ISSUE = 'quality_issue',
  COUNT_CORRECTION = 'count_correction',
  RETURN = 'return',
  SAMPLE = 'sample',
  OTHER = 'other',
}

@Entity('inventory_adjustments')
export class InventoryAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AdjustmentType })
  type: AdjustmentType;

  @Column({ type: 'enum', enum: AdjustmentReason })
  reason: AdjustmentReason;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  previousQuantity: number;

  @Column({ type: 'int' })
  newQuantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @Column({ type: 'uuid' })
  inventoryId: string;

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