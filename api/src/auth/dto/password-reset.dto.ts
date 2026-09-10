import { IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsPhoneNumber()
  phone: string;
}

export class ConfirmPasswordResetDto {
  @IsPhoneNumber()
  phone: string;

  @IsString()
  @Length(4, 6)
  code: string; // OTP code sent for password reset

  @IsString()
  @MinLength(8)
  newPassword: string;
}
