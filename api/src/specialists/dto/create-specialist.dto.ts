import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSpecialistDto {
  // Specialist accounts are provisioned directly by their own provider-admin
  // (no super-admin approval needed, unlike provider onboarding — a salon
  // owner adding their own staff doesn't need marketplace-level vetting).
  // The provider-admin sets a temporary password directly rather than the
  // specialist self-claiming via OTP; phoneVerified is set true on creation
  // since the provider is vouching for the phone, not the specialist
  // proving ownership of it themselves.
  @IsString()
  phone!: string;

  @IsString()
  @MinLength(8)
  temporaryPassword!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  specialty!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsBoolean()
  supportsVipHome?: boolean;
}