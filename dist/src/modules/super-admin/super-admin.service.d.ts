import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import { RedisService } from '../../shared/redis/redis.service';
import { UpdateTenantStatusDto, UpdateTenantPlanDto, ToggleFeatureDto } from './dto/super-admin.dto';
import { UserRole } from '@prisma/client';
export declare class SuperAdminService {
    private readonly prisma;
    private readonly tokenService;
    private readonly redis;
    constructor(prisma: PrismaService, tokenService: TokenService, redis: RedisService);
    listTenants(params: {
        status?: string;
        plan?: string;
    }): Promise<({
        _count: {
            users: number;
            courses: number;
        };
    } & {
        type: import("@prisma/client").$Enums.TenantType;
        name: string;
        subdomain: string;
        custom_domain: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        plan: import("@prisma/client").$Enums.PlanTier;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        plan_expires_at: Date | null;
        logo_url: string | null;
        favicon_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
        landing_template: string | null;
        max_students: number;
        max_teachers: number;
        max_storage_gb: number;
        features: import("@prisma/client/runtime/client").JsonValue;
        country_code: string | null;
        timezone: string | null;
    })[]>;
    getTenant(id: string): Promise<{
        users: {
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
            tenant_id: string;
            phone: string | null;
            password_hash: string;
            first_name: string;
            last_name: string;
            avatar_url: string | null;
            is_active: boolean;
            is_verified: boolean;
            locale: string | null;
            max_devices: number;
            last_login_at: Date | null;
            last_login_ip: string | null;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        }[];
    } & {
        type: import("@prisma/client").$Enums.TenantType;
        name: string;
        subdomain: string;
        custom_domain: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        plan: import("@prisma/client").$Enums.PlanTier;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        plan_expires_at: Date | null;
        logo_url: string | null;
        favicon_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
        landing_template: string | null;
        max_students: number;
        max_teachers: number;
        max_storage_gb: number;
        features: import("@prisma/client/runtime/client").JsonValue;
        country_code: string | null;
        timezone: string | null;
    }>;
    updateTenantStatus(id: string, dto: UpdateTenantStatusDto): Promise<{
        type: import("@prisma/client").$Enums.TenantType;
        name: string;
        subdomain: string;
        custom_domain: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        plan: import("@prisma/client").$Enums.PlanTier;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        plan_expires_at: Date | null;
        logo_url: string | null;
        favicon_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
        landing_template: string | null;
        max_students: number;
        max_teachers: number;
        max_storage_gb: number;
        features: import("@prisma/client/runtime/client").JsonValue;
        country_code: string | null;
        timezone: string | null;
    }>;
    updateTenantPlan(id: string, dto: UpdateTenantPlanDto): Promise<{
        type: import("@prisma/client").$Enums.TenantType;
        name: string;
        subdomain: string;
        custom_domain: string | null;
        id: string;
        status: import("@prisma/client").$Enums.TenantStatus;
        plan: import("@prisma/client").$Enums.PlanTier;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        plan_expires_at: Date | null;
        logo_url: string | null;
        favicon_url: string | null;
        primary_color: string | null;
        secondary_color: string | null;
        landing_template: string | null;
        max_students: number;
        max_teachers: number;
        max_storage_gb: number;
        features: import("@prisma/client/runtime/client").JsonValue;
        country_code: string | null;
        timezone: string | null;
    }>;
    impersonate(tenantId: string, superAdminId: string): Promise<{
        token: string;
    }>;
    listUsers(params: {
        role?: UserRole;
        tenantId?: string;
        search?: string;
    }): Promise<({
        tenant: {
            name: string;
            subdomain: string;
        };
    } & {
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        tenant_id: string;
        phone: string | null;
        password_hash: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_active: boolean;
        is_verified: boolean;
        locale: string | null;
        max_devices: number;
        last_login_at: Date | null;
        last_login_ip: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    })[]>;
    getDashboardStats(): Promise<{
        totalTenants: number;
        activeTenants: number;
        totalStudents: number;
        totalRevenueCents: number;
    }>;
    toggleFeature(tenantId: string, dto: ToggleFeatureDto): Promise<import("@prisma/client/runtime/client").JsonValue>;
}
