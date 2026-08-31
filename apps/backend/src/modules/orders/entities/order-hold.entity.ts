import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum HoldReason {
  FRAUD_CHECK = 'fraud_check',
  INVENTORY = 'inventory',
  PAYMENT = 'payment',
  ADDRESS_VERIFICATION = 'address_verification',
  CUSTOMER_REQUEST = 'customer_request',
  OTHER = 'other',
}

export enum HoldStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
}

@Entity('order_holds')
export class OrderHold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: HoldReason })
  reason: HoldReason;

  @Column({ type: 'enum', enum: HoldStatus, default: HoldStatus.ACTIVE })
  status: HoldStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  releasedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @ManyToOne(() => Order, order => order.holds)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}