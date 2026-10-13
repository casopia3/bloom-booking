import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProviderApplicationDto {
  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsString()
  @MinLength(2)
  contactName!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];
}