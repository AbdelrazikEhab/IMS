var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Patch, Post, Delete, Body, Param, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateBrandingDto, UpdateTenantSettingsDto, CreateEnrollmentCodeDto, } from './dto/tenant.dto';
let TenantController = class TenantController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async getCurrent(tenantId) {
        return this.tenantService.getCurrent(tenantId);
    }
    async updateBranding(tenantId, dto) {
        return this.tenantService.updateBranding(tenantId, dto);
    }
    async getStats(tenantId) {
        return this.tenantService.getStats(tenantId);
    }
    async updateSettings(tenantId, dto) {
        return this.tenantService.updateSettings(tenantId, dto);
    }
    async listCodes(tenantId) {
        return this.tenantService.listEnrollmentCodes(tenantId);
    }
    async createCode(tenantId, user, dto) {
        return this.tenantService.createEnrollmentCode(tenantId, user.id, dto);
    }
    async deactivateCode(tenantId, id) {
        return this.tenantService.deactivateEnrollmentCode(tenantId, id);
    }
};
__decorate([
    Get('current'),
    ApiOperation({ summary: 'Get current tenant info (from subdomain)' }),
    __param(0, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getCurrent", null);
__decorate([
    Patch('branding'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update platform branding' }),
    __param(0, TenantId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateBrandingDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateBranding", null);
__decorate([
    Get('stats'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Get tenant statistics' }),
    __param(0, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getStats", null);
__decorate([
    Patch('settings'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update tenant settings' }),
    __param(0, TenantId()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTenantSettingsDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateSettings", null);
__decorate([
    Get('enrollment-codes'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'List enrollment codes with usage stats' }),
    __param(0, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "listCodes", null);
__decorate([
    Post('enrollment-codes'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Generate enrollment code' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, CreateEnrollmentCodeDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "createCode", null);
__decorate([
    Delete('enrollment-codes/:id'),
    HttpCode(HttpStatus.NO_CONTENT),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Deactivate enrollment code' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "deactivateCode", null);
TenantController = __decorate([
    ApiTags('Tenant'),
    ApiBearerAuth(),
    Controller({ path: 'tenant', version: '1' }),
    __metadata("design:paramtypes", [TenantService])
], TenantController);
export { TenantController };
//# sourceMappingURL=tenant.controller.js.map