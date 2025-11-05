import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TabItem } from '../../tab-items/entities/tab-item.entity';
import { Establishment } from '../../auth/entities/establishment.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'numeric' })
  price: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Establishment, establishment => establishment.items, { nullable: false })
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @Column()
  establishment_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at?: Date;

  @OneToMany(() => TabItem, tabItem => tabItem.item)
  tabItems: TabItem[];
}
