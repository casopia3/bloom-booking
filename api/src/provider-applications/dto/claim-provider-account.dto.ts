import { IsString, MinLength } from 'class-validator';

export class ClaimProviderAccountDto {
  @IsString()
  phone!: string;

  @IsString()
  code!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}