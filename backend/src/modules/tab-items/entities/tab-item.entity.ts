import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tab } from '../../tabs/entities/tab.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('tab_items')
export class TabItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tab)
  @JoinColumn({ name: 'tab_id' })
  tab: Tab;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column('int')
  qty: number;

  @Column({ type: 'numeric' })
  unit_price: string;

  @Column({ type: 'numeric' })
  total: string; // qty * unit_price

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
