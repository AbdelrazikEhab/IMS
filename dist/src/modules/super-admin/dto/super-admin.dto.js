var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEnum, IsString, IsOptional, IsInt, Min, IsBoolean, IsDateString, } from 'class-validator';
import { TenantStatus, PlanTier } from '@prisma/client';
export class UpdateTenantStatusDto {
    status;
}
__decorate([
    IsEnum(TenantStatus),
    __metadata("design:type", String)
], UpdateTenantStatusDto.prototype, "status", void 0);
export class UpdateTenantPlanDto {
    plan;
    expiresAt;
    maxStudents;
    maxTeachers;
}
__decorate([
    IsEnum(PlanTier),
    __metadata("design:type", String)
], UpdateTenantPlanDto.prototype, "plan", void 0);
__decorate([
    IsOptional(),
    IsDateString(),
    __metadata("design:type", String)
], UpdateTenantPlanDto.prototype, "expiresAt", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateTenantPlanDto.prototype, "maxStudents", void 0);
__decorate([
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateTenantPlanDto.prototype, "maxTeachers", void 0);
export class ToggleFeatureDto {
    featureKey;
    enabled;
    metadata;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ToggleFeatureDto.prototype, "featureKey", void 0);
__decorate([
    IsBoolean(),
    __metadata("design:type", Boolean)
], ToggleFeatureDto.prototype, "enabled", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Object)
], ToggleFeatureDto.prototype, "metadata", void 0);
//# sourceMappingURL=super-admin.dto.js.map