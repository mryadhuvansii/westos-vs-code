import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Carrier } from './carrier.entity';
import { ShipmentItem } from './shipment-item.entity';
import { TrackingEvent } from './tracking-event.entity';
import { PackingSlip } from './packing-slip.entity';
import { Manifest } from './manifest.entity';
import { DeliveryException } from './delivery-exception.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED = 'picked',
  PACKED = 'packed',
  LABELED = 'labeled',
  HANDOVER = 'handover',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  shipmentNumber: string;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  trackingNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  trackingUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weight: string;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  pickedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  packedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  labeledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  handedOverAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => Order, order => order.shipments)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Carrier, carrier => carrier.shipments)
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier;

  @Column({ type: 'uuid', nullable: true })
  carrierId: string;

  @OneToMany(() => ShipmentItem, item => item.shipment)
  items: ShipmentItem[];

  @OneToMany(() => TrackingEvent, event => event.shipment)
  trackingEvents: TrackingEvent[];

  @OneToMany(() => PackingSlip, slip => slip.shipment)
  packingSlips: PackingSlip[];

  @OneToMany(() => Manifest, manifest => manifest.shipment)
  manifests: Manifest[];

  @OneToMany(() => DeliveryException, exception => exception.shipment)
  deliveryExceptions: DeliveryException[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}