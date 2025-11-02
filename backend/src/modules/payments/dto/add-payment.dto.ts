import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class AddPaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  note?: string;
}
