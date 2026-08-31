import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ReturnItem } from './return-item.entity';
import { ReturnInspection } from './return-inspection.entity';
import { RMARequest } from './rma-request.entity';

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReturnReason {
  WRONG_ITEM = 'wrong_item',
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  NOT_AS_DESCRIBED = 'not_as_described',
  SIZE_ISSUE = 'size_issue',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other',
}

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  returnNumber: string;

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.REQUESTED })
  status: ReturnStatus;

  @Column({ type: 'enum', enum: ReturnReason })
  reason: ReturnReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Order, order => order.returns)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @OneToMany(() => ReturnItem, item => item.returnRequest)
  items: ReturnItem[];

  @OneToMany(() => ReturnInspection, inspection => inspection.returnRequest)
  inspections: ReturnInspection[];

  @OneToMany(() => RMARequest, rma => rma.returnRequest)
  rmaRequests: RMARequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}