import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Warehouse } from './warehouse.entity';

@Entity('inventory_snapshots')
export class InventorySnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  snapshotType: string;

  @Column({ type: 'int' })
  totalVariants: number;

  @Column({ type: 'int' })
  totalQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalValue: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  warehouseId: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}