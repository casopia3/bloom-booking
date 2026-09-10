import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';

// adminUserId is not editable after creation — ownership transfer, if ever
// needed, should be its own explicit admin action, not a silent field update.
export class UpdateProviderDto extends PartialType(
  OmitType(CreateProviderDto, ['adminUserId'] as const),
) {}
