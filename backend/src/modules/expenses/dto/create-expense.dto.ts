import { IsString, IsNumberString, IsNumber } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumberString()
  amount: string;

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;
}

