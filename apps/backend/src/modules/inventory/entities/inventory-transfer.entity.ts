import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { InventoryTransferItem } from './inventory-transfer-item.entity';

export enum TransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('inventory_transfers')
export class InventoryTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transferNumber: string;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.outgoingTransfers)
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse: Warehouse;

  @Column({ type: 'uuid' })
  sourceWarehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.incomingTransfers)
  @JoinColumn({ name: 'destination_warehouse_id' })
  destinationWarehouse: Warehouse;

  @Column({ type: 'uuid' })
  destinationWarehouseId: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @OneToMany(() => InventoryTransferItem, item => item.transfer)
  items: InventoryTransferItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}