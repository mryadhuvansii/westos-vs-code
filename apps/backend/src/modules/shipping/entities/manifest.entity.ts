import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from './shipment.entity';
import { Carrier } from './carrier.entity';

export enum ManifestStatus {
  CREATED = 'created',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('manifests')
export class Manifest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  manifestNumber: string;

  @Column({ type: 'enum', enum: ManifestStatus, default: ManifestStatus.CREATED })
  status: ManifestStatus;

  @Column({ type: 'jsonb', nullable: true })
  carrierManifestId: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @ManyToOne(() => Shipment, shipment => shipment.manifests)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ type: 'uuid' })
  shipmentId: string;

  @ManyToOne(() => Carrier)
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier;

  @Column({ type: 'uuid' })
  carrierId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}