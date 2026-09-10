import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(5)
  durationMin!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  category?: string; // free-text — matches mockup chips (Spa, Haircut, etc.)
  // pending a confirmed fixed taxonomy from the client

  @IsOptional()
  @IsBoolean()
  availableStandard?: boolean; // default true, set in service

  @IsOptional()
  @IsBoolean()
  availableVip?: boolean; // default false — must opt in to VIP Home Service
}
