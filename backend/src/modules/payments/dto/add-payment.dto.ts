import { IsEnum, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class AddPaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
