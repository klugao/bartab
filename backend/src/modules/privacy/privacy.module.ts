import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';
import { User } from '../auth/entities/user.entity';
import { Establishment } from '../auth/entities/establishment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Tab } from '../tabs/entities/tab.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Item } from '../items/entities/item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Establishment,
      Customer,
      Tab,
      Payment,
      Item,
    ]),
  ],
  controllers: [PrivacyController],
  providers: [PrivacyService],
  exports: [PrivacyService],
})
export class PrivacyModule {}

