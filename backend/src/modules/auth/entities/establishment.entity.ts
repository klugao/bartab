import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Tab } from '../../tabs/entities/tab.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ApprovalStatus } from '../../../common/enums';

@Entity('establishments')
export class Establishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: true })
  active: boolean;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDENTE,
  })
  statusAprovacao: ApprovalStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => User, user => user.establishment)
  users: User[];

  @OneToMany(() => Customer, customer => customer.establishment)
  customers: Customer[];

  @OneToMany(() => Item, item => item.establishment)
  items: Item[];

  @OneToMany(() => Tab, tab => tab.establishment)
  tabs: Tab[];

  @OneToMany(() => Expense, expense => expense.establishment)
  expenses: Expense[];
}

