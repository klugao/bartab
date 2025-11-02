import { IsUUID, IsInt, Min, IsOptional, IsNumberString } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(1)
  qty: number;

  @IsOptional()
  @IsNumberString()
  unitPrice?: string;
}
