import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum NoteType {
  CUSTOMER = 'customer',
  INTERNAL = 'internal',
  SYSTEM = 'system',
}

@Entity('order_notes')
export class OrderNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NoteType })
  type: NoteType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid', nullable: true })
  authorId: string;

  @Column({ type: 'boolean', default: false })
  isCustomerVisible: boolean;

  @ManyToOne(() => Order, order => order.notes)
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