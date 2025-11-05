import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ItemsModule } from './modules/items/items.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PrivacyModule } from './modules/privacy/privacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://pdv:pdv@localhost:5432/pdv_dev',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      extra: {
        // Força uso de IPv4 para evitar erro ENETUNREACH com IPv6
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000,
      },
      poolSize: 10,
      maxQueryExecutionTime: 1000,
    }),
    AuthModule,
    CustomersModule,
    ItemsModule,
    TabsModule,
    ExpensesModule,
    AdminModule,
    NotificationModule,
    PrivacyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async onModuleInit() {
    // Configura o timezone para o fuso horário de São Paulo
    await this.dataSource.query("SET TIME ZONE 'America/Sao_Paulo'");
    console.log('✅ Timezone configurado para America/Sao_Paulo');
  }
}