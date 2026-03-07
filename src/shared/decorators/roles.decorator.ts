import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) — restricts endpoint to specified roles.
 * Used with RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
