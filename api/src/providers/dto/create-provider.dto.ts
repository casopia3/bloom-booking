import { IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProviderDto {
  // The user account this provider profile attaches to — created separately
  // via an admin-provisioning flow, not public registration (confirmed decision,
  // see AuthService.register comment: self-registration is always CUSTOMER).
  @IsString()
  adminUserId!: string;

  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  supportsVipHome?: boolean;

  @IsOptional()
  @IsNumber()
  vipServiceRadiusKm?: number;

  @IsOptional()
  @IsNumber()
  vipTravelFee?: number;
}
