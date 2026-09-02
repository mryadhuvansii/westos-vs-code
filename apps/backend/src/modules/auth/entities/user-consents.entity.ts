import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_consents')
export class UserConsents {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'marketing_email', default: false })
  marketingEmail: boolean;

  @Column({ name: 'marketing_sms', default: false })
  marketingSms: boolean;

  @Column({ name: 'marketing_whatsapp', default: false })
  marketingWhatsapp: boolean;

  @Column({ name: 'marketing_push', default: false })
  marketingPush: boolean;

  @Column({ name: 'analytics', default: false })
  analytics: boolean;

  @Column({ name: 'personalization', default: false })
  personalization: boolean;

  @Column({ default: 1 })
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.consents)
  @JoinColumn({ name: 'user_id' })
  user: User;
}