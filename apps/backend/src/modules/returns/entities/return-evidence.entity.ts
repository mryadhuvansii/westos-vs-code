import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnItem } from './return-item.entity';

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('return_evidence')
export class ReturnEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EvidenceType })
  type: EvidenceType;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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