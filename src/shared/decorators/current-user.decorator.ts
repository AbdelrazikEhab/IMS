import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../types/request.type';

/**
 * @CurrentUser() — injects the authenticated user from the request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.user;
  },
);
