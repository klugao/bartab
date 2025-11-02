import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TabsService } from './tabs.service';
import { TabsController } from './tabs.controller';
import { Tab } from './entities/tab.entity';
import { TabItem } from '../tab-items/entities/tab-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CustomersModule } from '../customers/customers.module';
import { ItemsModule } from '../items/items.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tab, TabItem, Payment]),
    CustomersModule,
    ItemsModule,
    ExpensesModule,
  ],
  controllers: [TabsController],
  providers: [TabsService],
  exports: [TabsService],
})
export class TabsModule {}
