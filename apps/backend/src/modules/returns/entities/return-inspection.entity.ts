import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnRequest } from './return-request.entity';
import { ReturnItem } from './return-item.entity';

export enum InspectionResult {
  PASS = 'pass',
  FAIL = 'fail',
  PARTIAL = 'partial',
}

@Entity('return_inspections')
export class ReturnInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InspectionResult })
  result: InspectionResult;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  checklist: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  inspectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  inspectedAt: Date;

  @ManyToOne(() => ReturnRequest, request => request.inspections)
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({ type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnItem)
  @JoinColumn({ name: 'return_item_id' })
  returnItem: ReturnItem;

  @Column({ type: 'uuid' })
  returnItemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}