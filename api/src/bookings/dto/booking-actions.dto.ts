import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RescheduleBookingDto {
  @IsDateString()
  newScheduledAt: string;
}

export class AssignSpecialistDto {
  @IsString()
  specialistId: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
