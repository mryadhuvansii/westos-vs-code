import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('fabrics')
export class Fabric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  composition: string;

  @Column({ type: 'text', nullable: true })
  stretch: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight: string;

  @Column({ type: 'text', nullable: true })
  feel: string;

  @Column({ type: 'text', nullable: true, name: 'care_instructions' })
  careInstructions: string;

  @OneToMany(() => Product, product => product.fabric)
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}