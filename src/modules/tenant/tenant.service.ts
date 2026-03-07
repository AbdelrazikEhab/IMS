import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import {
  UpdateBrandingDto,
  UpdateTenantSettingsDto,
  CreateEnrollmentCodeDto,
} from './dto/tenant.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getCurrent(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateBranding(tenantId: string, dto: UpdateBrandingDto) {
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

    // Invalidate Redis cache
    await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);

    return tenant;
  }

  async updateSettings(tenantId: string, dto: UpdateTenantSettingsDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        timezone: dto.timezone,
      },
    });

    await this.redis.del(`tenant:subdomain:${tenant.subdomain}`);
    return tenant;
  }

  async getStats(tenantId: string) {
    const [studentsCount, coursesCount, booksCount, paymentsAgg] =
      await Promise.all([
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

  async listEnrollmentCodes(tenantId: string) {
    return this.prisma.enrollmentCode.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createEnrollmentCode(
    tenantId: string,
    teacherId: string,
    dto: CreateEnrollmentCodeDto,
  ) {
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

  async deactivateEnrollmentCode(tenantId: string, codeId: string) {
    const code = await this.prisma.enrollmentCode.findFirst({
      where: { id: codeId, tenant_id: tenantId },
    });
    if (!code) throw new NotFoundException('Enrollment code not found');

    return this.prisma.enrollmentCode.update({
      where: { id: codeId },
      data: { is_active: false },
    });
  }

  private generateCode(): string {
    return randomBytes(5).toString('hex').toUpperCase();
  }
}
