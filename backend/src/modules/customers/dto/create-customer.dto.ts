import { IsString, IsOptional, IsEmail, MinLength, IsNotEmpty } from 'class-validator';
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

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value === '' ? undefined : value)
  email?: string;
}
