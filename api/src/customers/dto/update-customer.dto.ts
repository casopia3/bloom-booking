// NEW FILE: api/src/customers/dto/update-customer.dto.ts

import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  occupation?: string;
}