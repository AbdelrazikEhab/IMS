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
import { Controller, Get, Post, Patch, Body, Param, Query, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UpdateTenantStatusDto, UpdateTenantPlanDto, ToggleFeatureDto, } from './dto/super-admin.dto';
let SuperAdminController = class SuperAdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboard() {
        return this.adminService.getDashboardStats();
    }
    listTenants(status, plan) {
        return this.adminService.listTenants({ status, plan });
    }
    getTenant(id) {
        return this.adminService.getTenant(id);
    }
    updateStatus(id, dto) {
        return this.adminService.updateTenantStatus(id, dto);
    }
    updatePlan(id, dto) {
        return this.adminService.updateTenantPlan(id, dto);
    }
    impersonate(tenantId, admin) {
        return this.adminService.impersonate(tenantId, admin.id);
    }
    getFeatures(id) {
        return this.adminService.getTenant(id).then((t) => t.features);
    }
    toggleFeature(id, dto) {
        return this.adminService.toggleFeature(id, dto);
    }
    listUsers(role, tenantId, search) {
        return this.adminService.listUsers({ role, tenantId, search });
    }
};
__decorate([
    Get('dashboard'),
    ApiOperation({ summary: 'Platform-wide stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getDashboard", null);
__decorate([
    Get('tenants'),
    __param(0, Query('status')),
    __param(1, Query('plan')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "listTenants", null);
__decorate([
    Get('tenants/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getTenant", null);
__decorate([
    Patch('tenants/:id/status'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTenantStatusDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateStatus", null);
__decorate([
    Patch('tenants/:id/plan'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTenantPlanDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updatePlan", null);
__decorate([
    Post('tenants/:id/impersonate'),
    __param(0, Param('id')),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "impersonate", null);
__decorate([
    Get('tenants/:id/features'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getFeatures", null);
__decorate([
    Patch('tenants/:id/features'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ToggleFeatureDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "toggleFeature", null);
__decorate([
    Get('users'),
    __param(0, Query('role')),
    __param(1, Query('tenantId')),
    __param(2, Query('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "listUsers", null);
SuperAdminController = __decorate([
    ApiTags('Super Admin'),
    ApiBearerAuth(),
    Roles(UserRole.SUPER_ADMIN),
    Controller({ path: 'super-admin', version: '1' }),
    __metadata("design:paramtypes", [SuperAdminService])
], SuperAdminController);
export { SuperAdminController };
//# sourceMappingURL=super-admin.controller.js.map