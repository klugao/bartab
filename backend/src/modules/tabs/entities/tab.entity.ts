import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { TabItem } from '../../tab-items/entities/tab-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Establishment } from '../../auth/entities/establishment.entity';

export enum TabStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

@Entity('tabs')
export class Tab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer | null;

  @Column({ type: 'enum', enum: TabStatus })
  status: TabStatus;

  @ManyToOne(() => Establishment, establishment => establishment.tabs, { nullable: false })
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  establishment_id: string;

  @CreateDateColumn()
  opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at?: Date;

  @OneToMany(() => TabItem, tabItem => tabItem.tab)
  tabItems: TabItem[];

  @OneToMany(() => Payment, payment => payment.tab)
  payments: Payment[];
}
