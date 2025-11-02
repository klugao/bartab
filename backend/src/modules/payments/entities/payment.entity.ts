import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Tab } from '../../tabs/entities/tab.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
  LATER = 'LATER'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tab)
  @JoinColumn({ name: 'tab_id' })
  tab: Tab;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'numeric' })
  amount: string;

  @CreateDateColumn()
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;
}
