import { IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/; // "HH:MM", 24h

export class SetAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:MM 24h format' })
  startTime!: string;

  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:MM 24h format' })
  endTime!: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  slotMinutes?: number;

  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'breakStart must be in HH:MM 24h format' })
  breakStart?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'breakEnd must be in HH:MM 24h format' })
  breakEnd?: string;

  // Set only when this entry is a specialist-specific override rather than
  // the provider-wide default — see Availability.specialistId in schema.prisma.
  @IsOptional()
  @IsString()
  specialistId?: string;
}
