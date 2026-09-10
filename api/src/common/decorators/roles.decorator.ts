import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Usage: @Roles(UserRole.PROVIDER_ADMIN, UserRole.SUPER_ADMIN)
 * Applied per-route, checked by RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
