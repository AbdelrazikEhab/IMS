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
import { RedisService } from '../../shared/redis/redis.service';
import { randomBytes } from 'crypto';
let TenantService = class TenantService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getCurrent(tenantId) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId },
        });
        if (!tenant)
            throw new NotFoundException('Tenant not found');
        return tenant;
    }
    async updateBranding(tenantId, dto) {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                logo_url: dto.logoUrl,
                favicon_url: dto.faviconUrl,
                primary_color: dto.primaryColor,
                secondary_color: dto.secondaryColor,
                landing_template: dto.landingTemplate,
            },
        });
        await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
        return tenant;
    }
    async updateSettings(tenantId, dto) {
        const tenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                timezone: dto.timezone,
            },
        });
        await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
        return tenant;
    }
    async getStats(tenantId) {
        const [studentsCount, coursesCount, booksCount, paymentsAgg] = await Promise.all([
            this.prisma.user.count({
                where: { tenant_id: tenantId, role: 'STUDENT' },
            }),
            this.prisma.course.count({ where: { tenant_id: tenantId } }),
            this.prisma.book.count({ where: { tenant_id: tenantId } }),
            this.prisma.payment.aggregate({
                where: { tenant_id: tenantId, status: 'ACTIVE' },
                _sum: { amount_cents: true },
            }),
        ]);
        return {
            studentsCount,
            coursesCount,
            booksCount,
            totalRevenueCents: paymentsAgg._sum.amount_cents ?? 0,
        };
    }
    async listEnrollmentCodes(tenantId) {
        return this.prisma.enrollmentCode.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createEnrollmentCode(tenantId, teacherId, dto) {
        const code = this.generateCode();
        return this.prisma.enrollmentCode.create({
            data: {
                tenant_id: tenantId,
                teacher_id: teacherId,
                code,
                max_uses: dto.maxUses,
                expires_at: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            },
        });
    }
    async deactivateEnrollmentCode(tenantId, codeId) {
        const code = await this.prisma.enrollmentCode.findFirst({
            where: { id: codeId, tenant_id: tenantId },
        });
        if (!code)
            throw new NotFoundException('Enrollment code not found');
        return this.prisma.enrollmentCode.update({
            where: { id: codeId },
            data: { is_active: false },
        });
    }
    generateCode() {
        return randomBytes(5).toString('hex').toUpperCase();
    }
};
TenantService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        RedisService])
], TenantService);
export { TenantService };
//# sourceMappingURL=tenant.service.js.map