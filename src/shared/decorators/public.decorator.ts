import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() — marks an endpoint as publicly accessible (no JWT required).
 * Every endpoint is private by default (Rule 5).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
