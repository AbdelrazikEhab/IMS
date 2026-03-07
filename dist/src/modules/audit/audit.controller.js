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
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    list(tenantId, pagination) {
        return this.auditService.list(tenantId, pagination);
    }
};
__decorate([
    Get(),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: "Teacher: view tenant's audit trail" }),
    __param(0, TenantId()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CursorPaginationDto]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "list", null);
AuditController = __decorate([
    ApiTags('Audit Logs'),
    ApiBearerAuth(),
    Controller({ path: 'audit-logs', version: '1' }),
    __metadata("design:paramtypes", [AuditService])
], AuditController);
export { AuditController };
//# sourceMappingURL=audit.controller.js.map