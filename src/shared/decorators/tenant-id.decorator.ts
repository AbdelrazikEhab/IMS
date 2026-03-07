import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest } from '../types/request.type';

/**
 * @TenantId() — injects current tenant ID from the request context.
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.tenantId;
  },
);
