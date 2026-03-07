import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import { RedisService } from '../../shared/redis/redis.service';
import {
  UpdateTenantStatusDto,
  UpdateTenantPlanDto,
  ToggleFeatureDto,
} from './dto/super-admin.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly redis: RedisService,
  ) {}

  async listTenants(params: { status?: string; plan?: string }) {
    return this.prisma.tenant.findMany({
      where: {
        status: params.status as any,
        plan: params.plan as any,
      },
      include: {
        _count: {
          select: { users: true, courses: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: { where: { role: UserRole.TEACHER }, take: 5 },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateTenantStatus(id: string, dto: UpdateTenantStatusDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
    return tenant;
  }

  async updateTenantPlan(id: string, dto: UpdateTenantPlanDto) {
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

  async impersonate(tenantId: string, superAdminId: string) {
    const teacher = await this.prisma.user.findFirst({
      where: { tenant_id: tenantId, role: UserRole.TEACHER },
    });
    if (!teacher)
      throw new NotFoundException('No teacher found for this tenant');

    const token = await this.tokenService.generateImpersonationToken(
      teacher,
      superAdminId,
    );
    return { token };
  }

  async listUsers(params: {
    role?: UserRole;
    tenantId?: string;
    search?: string;
  }) {
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

  async toggleFeature(tenantId: string, dto: ToggleFeatureDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const features = (tenant.features as any) || {};
    features[dto.featureKey] = dto.enabled;
    if (dto.metadata) features[`${dto.featureKey}_meta`] = dto.metadata;

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { features },
    });

    await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
    return updated.features;
  }
}
