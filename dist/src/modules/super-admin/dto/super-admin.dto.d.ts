import { TenantStatus, PlanTier } from '@prisma/client';
export declare class UpdateTenantStatusDto {
    status: TenantStatus;
}
export declare class UpdateTenantPlanDto {
    plan: PlanTier;
    expiresAt?: string;
    maxStudents?: number;
    maxTeachers?: number;
}
export declare class ToggleFeatureDto {
    featureKey: string;
    enabled: boolean;
    metadata?: any;
}
