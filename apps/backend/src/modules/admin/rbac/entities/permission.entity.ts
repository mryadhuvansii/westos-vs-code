import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToMany } from 'typeorm';

@Entity('permissions')
@Index(['resource', 'action', 'scope'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50, default: 'all' })
  scope: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}