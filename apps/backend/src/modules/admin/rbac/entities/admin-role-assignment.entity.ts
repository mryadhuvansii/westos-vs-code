import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AdminUser } from '../../auth/entities/admin-user.entity';
import { Role } from './role.entity';

@Entity('admin_role_assignments')
@Index(['adminUserId'])
@Index(['roleId'])
export class AdminRoleAssignment {
  @PrimaryColumn('uuid')
  adminUserId: string;

  @PrimaryColumn('uuid')
  roleId: string;

  @Column({ type: 'uuid', array: true, nullable: true })
  warehouseScope: string[];

  @Column({ nullable: true })
  assignedBy: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @ManyToOne(() => AdminUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_user_id' })
  adminUser: AdminUser;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}