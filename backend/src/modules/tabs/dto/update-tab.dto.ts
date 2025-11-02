import { IsOptional, IsUUID, IsString } from 'class-validator';

export class UpdateTabDto {
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: 'customerId deve ser um UUID válido' })
  customerId?: string | null;
}

