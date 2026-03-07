import {
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { TenantStatus, PlanTier, UserRole } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus)
  status: TenantStatus;
}

export class UpdateTenantPlanDto {
  @IsEnum(PlanTier)
  plan: PlanTier;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxStudents?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxTeachers?: number;
}

export class ToggleFeatureDto {
  @IsString()
  featureKey: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  metadata?: any;
}
