import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from '../../catalogue/entities/product-variant.entity';
import { WarehouseLocation } from './warehouse-location.entity';

@Entity('inventories')
@Index(['warehouseId'])
@Index(['variantId'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @Column({ type: 'uuid', nullable: true })
  locationId: string;

  @Column({ type: 'uuid' })
  variantId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0, name: 'reserved_quantity' })
  reservedQuantity: number;

  @Column({ type: 'int', default: 0, name: 'available_quantity' })
  availableQuantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bin: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rack: string;

  @Column({ type: 'date', nullable: true, name: 'last_counted_at' })
  lastCountedAt: Date;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @ManyToOne(() => WarehouseLocation, (location) => location.inventory)
  @JoinColumn({ name: 'locationId' })
  location: WarehouseLocation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
