import { IsString, IsNumberString, IsNumber, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsNumberString()
  amount: string;

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;
}

