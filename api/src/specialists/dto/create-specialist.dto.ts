import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSpecialistDto {
  // As with providers, specialist accounts are provisioned by an existing
  // provider-admin against an already-created user account — not self-registered
  // (same confirmed decision as provider onboarding).
  @IsString()
  userId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  specialty: string; // "Hairstylist", "Makeup Artist", "Nail Technician"

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
