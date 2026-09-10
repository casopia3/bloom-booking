import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingType } from '@prisma/client';

class VipLocationDto {
  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreateBookingDto {
  @IsString()
  serviceProviderId: string;

  // Optional at creation — supports service-first flow where no specialist
  // is chosen yet (provider assigns later). Required for VIP per blueprint
  // Section H ("Specialist (VIP-enabled)" is a required step in that flow).
  @ValidateIf((o) => o.bookingType === BookingType.VIP_HOME)
  @IsString()
  specialistId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  serviceIds: string[];

  @IsEnum(BookingType)
  bookingType: BookingType;

  @IsDateString()
  scheduledAt: string; // ISO datetime for the slot start

  @ValidateIf((o) => o.bookingType === BookingType.VIP_HOME)
  @ValidateNested()
  @Type(() => VipLocationDto)
  location?: VipLocationDto;

  @IsOptional()
  @IsString()
  note?: string;
}
