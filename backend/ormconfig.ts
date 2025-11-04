import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Customer } from './src/modules/customers/entities/customer.entity';
import { Item } from './src/modules/items/entities/item.entity';
import { Tab } from './src/modules/tabs/entities/tab.entity';
import { TabItem } from './src/modules/tab-items/entities/tab-item.entity';
import { Payment } from './src/modules/payments/entities/payment.entity';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: [Customer, Item, Tab, TabItem, Payment],
  migrations: ['src/migrations/*.ts'],
  synchronize: configService.get('NODE_ENV') !== 'production', // Sincronização apenas em desenvolvimento
  logging: configService.get('NODE_ENV') === 'development',
  extra: {
    // Define o fuso horário de São Paulo
    timezone: 'America/Sao_Paulo',
  },
});
