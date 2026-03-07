var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import { RedisService } from '../../shared/redis/redis.service';
import { UserRole } from '@prisma/client';
let SuperAdminService = class SuperAdminService {
    prisma;
    tokenService;
    redis;
    constructor(prisma, tokenService, redis) {
        this.prisma = prisma;
        this.tokenService = tokenService;
        this.redis = redis;
    }
    async listTenants(params) {
        return this.prisma.tenant.findMany({
            where: {
                status: params.status,
                plan: params.plan,
            },
            include: {
                _count: {
                    select: { users: true, courses: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getTenant(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                users: { where: { role: UserRole.TEACHER }, take: 5 },
            },
        });
        if (!tenant)
            throw new NotFoundException('Tenant not found');
        return tenant;
    }
    async updateTenantStatus(id, dto) {
        const tenant = await this.prisma.tenant.update({
            where: { id },
            data: { status: dto.status },
        });
        await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
        return tenant;
    }
    async updateTenantPlan(id, dto) {
        const tenant = await this.prisma.tenant.update({
            where: { id },
            data: {
                plan: dto.plan,
                plan_expires_at: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                max_students: dto.maxStudents,
                max_teachers: dto.maxTeachers,
            },
        });
        await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
        return tenant;
    }
    async impersonate(tenantId, superAdminId) {
        const teacher = await this.prisma.user.findFirst({
            where: { tenant_id: tenantId, role: UserRole.TEACHER },
        });
        if (!teacher)
            throw new NotFoundException('No teacher found for this tenant');
        const token = await this.tokenService.generateImpersonationToken(teacher, superAdminId);
        return { token };
    }
    async listUsers(params) {
        return this.prisma.user.findMany({
            where: {
                role: params.role,
                tenant_id: params.tenantId,
                OR: params.search
                    ? [
                        { email: { contains: params.search, mode: 'insensitive' } },
                        { first_name: { contains: params.search, mode: 'insensitive' } },
                        { last_name: { contains: params.search, mode: 'insensitive' } },
                    ]
                    : undefined,
            },
            include: { tenant: { select: { subdomain: true, name: true } } },
            take: 100,
        });
    }
    async getDashboardStats() {
        const [tenants, activeTenants, users, payments] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { role: 'STUDENT' } }),
            this.prisma.payment.aggregate({
                where: { status: 'ACTIVE' },
                _sum: { amount_cents: true },
            }),
        ]);
        return {
            totalTenants: tenants,
            activeTenants,
            totalStudents: users,
            totalRevenueCents: payments._sum.amount_cents ?? 0,
        };
    }
    async toggleFeature(tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new NotFoundException('Tenant not found');
        const features = tenant.features || {};
        features[dto.featureKey] = dto.enabled;
        if (dto.metadata)
            features[`${dto.featureKey}_meta`] = dto.metadata;
        const updated = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { features },
        });
        await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
        return updated.features;
    }
};
SuperAdminService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        TokenService,
        RedisService])
], SuperAdminService);
export { SuperAdminService };
//# sourceMappingURL=super-admin.service.js.map