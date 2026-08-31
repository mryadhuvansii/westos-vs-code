import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('admin_2fa')
export class Admin2fa {
  @PrimaryColumn('uuid')
  adminUserId: string;

  @Column({ length: 255 })
  secret: string;

  @Column({ type: 'text', array: true, nullable: true })
  backupCodes: string[];

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: true })
  enforced: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relation
  adminUser: AdminUser;
}