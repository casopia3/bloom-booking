import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSpecialistDto } from './create-specialist.dto';

// Updating a specialist's profile should never change their login
// credentials — phone/temporaryPassword are account-creation-only fields,
// so they're excluded here the same way userId used to be.
export class UpdateSpecialistDto extends PartialType(
  OmitType(CreateSpecialistDto, ['phone', 'temporaryPassword'] as const),
) {}