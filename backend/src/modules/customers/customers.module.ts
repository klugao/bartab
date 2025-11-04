import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { Customer } from './entities/customer.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Payment])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService], // Exportar para uso em outros módulos (ex: TabsService)
})
export class CustomersModule {}
