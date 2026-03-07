import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { AppRequest } from '../types/request.type';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AppRequest>();

    // Super admin endpoints don't need tenant context
    const path = request.path || '';
    if (
      path.startsWith('/api/v1/super-admin') ||
      path.startsWith('/health') ||
      path.startsWith('/metrics')
    ) {
      return true;
    }

    if (isPublic && !request.tenantId) return true;

    // Tenant must be resolved by TenantMiddleware before this guard runs
    if (!request.tenantId) {
      throw new ForbiddenException('Tenant context not found');
    }

    if (request.tenant?.status === 'SUSPENDED') {
      throw new ForbiddenException('This platform has been suspended');
    }

    return true;
  }
}
