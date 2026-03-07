var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantMiddleware_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
const TENANT_CACHE_TTL = 300;
let TenantMiddleware = TenantMiddleware_1 = class TenantMiddleware {
    prisma;
    redis;
    logger = new Logger(TenantMiddleware_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async use(req, res, next) {
        const appReq = req;
        const path = req.path || '';
        if (path.startsWith('/api/v1/super-admin') ||
            path === '/health' ||
            path === '/metrics') {
            return next();
        }
        const host = req.hostname || '';
        const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';
        let subdomain = null;
        if (host && !host.endsWith(platformDomain)) {
            subdomain = `custom:${host}`;
        }
        else {
            const parts = host.split('.');
            if (parts.length >= 2) {
                subdomain = parts[0];
            }
        }
        if (!subdomain || subdomain === 'api' || subdomain === 'www') {
            return next();
        }
        const cacheKey = `tenant:subdomain:${subdomain}`;
        let tenant = await this.redis.getJson(cacheKey);
        if (!tenant) {
            const whereClause = subdomain.startsWith('custom:')
                ? { custom_domain: subdomain.replace('custom:', ''), deleted_at: null }
                : { subdomain, deleted_at: null };
            const dbTenant = await this.prisma.tenant.findFirst({
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
                id: dbTenant.id,
                subdomain: dbTenant.subdomain,
                name: dbTenant.name,
                status: dbTenant.status,
                plan: dbTenant.plan,
                features: dbTenant.features || {},
            };
            await this.redis.setJson(cacheKey, tenant, TENANT_CACHE_TTL);
        }
        if (tenant.status === 'SUSPENDED') {
            throw new ForbiddenException('This platform has been suspended');
        }
        appReq.tenant = tenant;
        appReq.tenantId = tenant.id;
        next();
    }
};
TenantMiddleware = TenantMiddleware_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        RedisService])
], TenantMiddleware);
export { TenantMiddleware };
//# sourceMappingURL=tenant.middleware.js.map