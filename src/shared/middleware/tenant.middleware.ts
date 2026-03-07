import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AppRequest } from '../types/request.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const TENANT_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const appReq = req as AppRequest;

    // Skip super-admin routes, health, and metrics
    const path = req.path || '';
    if (
      path.startsWith('/api/v1/super-admin') ||
      path === '/health' ||
      path === '/metrics'
    ) {
      return next();
    }

    // Extract subdomain from Host header
    const host = req.hostname || '';
    const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';

    let subdomain: string | null = null;

    // Check custom domain first
    if (host && !host.endsWith(platformDomain)) {
      subdomain = `custom:${host}`;
    } else {
      const parts = host.split('.');
      if (parts.length >= 2) {
        subdomain = parts[0];
      }
    }

    if (!subdomain || subdomain === 'api' || subdomain === 'www') {
      return next();
    }

    const cacheKey = `tenant:subdomain:${subdomain}`;

    // Try Redis cache first
    let tenant = await this.redis.getJson<AppRequest['tenant']>(cacheKey);

    if (!tenant) {
      // Cache miss — query DB
      const whereClause = subdomain.startsWith('custom:')
        ? { custom_domain: subdomain.replace('custom:', ''), deleted_at: null }
        : { subdomain, deleted_at: null };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const dbTenant = await (this.prisma.tenant as any).findFirst({
        where: whereClause,
        select: {
          id: true,
          subdomain: true,
          name: true,
          status: true,
          plan: true,
          features: true,
        },
      });

      if (!dbTenant) {
        throw new NotFoundException(`Tenant '${subdomain}' not found`);
      }

      tenant = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: dbTenant.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        subdomain: dbTenant.subdomain,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        name: dbTenant.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status: dbTenant.status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        plan: dbTenant.plan,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        features: (dbTenant.features as Record<string, unknown>) || {},
      };

      // Cache it
      await this.redis.setJson(cacheKey, tenant, TENANT_CACHE_TTL);
    }

    if (tenant.status === 'SUSPENDED') {
      throw new ForbiddenException('This platform has been suspended');
    }

    appReq.tenant = tenant;
    appReq.tenantId = tenant.id;

    next();
  }
}
