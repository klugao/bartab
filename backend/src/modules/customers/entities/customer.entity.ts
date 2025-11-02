import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Tab } from '../../tabs/entities/tab.entity';
import { Establishment } from '../../auth/entities/establishment.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0, nullable: false })
  balance_due: string; // Usar string para numeric no TypeORM

  @ManyToOne(() => Establishment, establishment => establishment.customers, { nullable: false })
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  establishment_id: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Tab, tab => tab.customer)
  tabs: Tab[];
}
