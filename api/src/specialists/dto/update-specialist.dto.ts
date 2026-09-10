import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSpecialistDto } from './create-specialist.dto';

export class UpdateSpecialistDto extends PartialType(
  OmitType(CreateSpecialistDto, ['userId'] as const),
) {}
