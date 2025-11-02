import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Establishment } from '../../auth/entities/establishment.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'numeric' })
  amount: string;

  @Column()
  year: number;

  @Column()
  month: number;

  @ManyToOne(() => Establishment, establishment => establishment.expenses, { nullable: false })
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  establishment_id: string;

  @CreateDateColumn()
  created_at: Date;
}

