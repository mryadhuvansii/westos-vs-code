import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Inventory } from './inventory.entity';

@Entity('warehouse_locations')
@Unique(['warehouseId', 'code'])
export class WarehouseLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  zone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  aisle: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rack: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shelf: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bin: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isPickable: boolean;

  @Column({ type: 'boolean', default: true })
  isReplenishable: boolean;

  @ManyToOne(() => Warehouse, warehouse => warehouse.locations)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @OneToMany(() => Inventory, inventory => inventory.location)
  inventory: Inventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}