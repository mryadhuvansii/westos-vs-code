import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';

export enum ExceptionType {
  ADDRESS_ISSUE = 'address_issue',
  RECIPIENT_UNAVAILABLE = 'recipient_unavailable',
  WEATHER_DELAY = 'weather_delay',
  CUSTOMS_HOLD = 'customs_hold',
  DAMAGED_IN_TRANSIT = 'damaged_in_transit',
  LOST = 'lost',
  OTHER = 'other',
}

export enum ExceptionStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

@Entity('delivery_exceptions')
export class DeliveryException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ExceptionType })
  type: ExceptionType;

  @Column({ type: 'enum', enum: ExceptionStatus, default: ExceptionStatus.OPEN })
  status: ExceptionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  resolvedBy: string;

  @ManyToOne(() => Shipment, shipment => shipment.deliveryExceptions)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ type: 'uuid' })
  shipmentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}