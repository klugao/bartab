import { IsString, IsOptional, MinLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  phone?: string;
}
