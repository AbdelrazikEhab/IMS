var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ForbiddenException, } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
let TenantGuard = class TenantGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        const path = request.path || '';
        if (path.startsWith('/api/v1/super-admin') ||
            path.startsWith('/health') ||
            path.startsWith('/metrics')) {
            return true;
        }
        if (isPublic && !request.tenantId)
            return true;
        if (!request.tenantId) {
            throw new ForbiddenException('Tenant context not found');
        }
        if (request.tenant?.status === 'SUSPENDED') {
            throw new ForbiddenException('This platform has been suspended');
        }
        return true;
    }
};
TenantGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], TenantGuard);
export { TenantGuard };
//# sourceMappingURL=tenant.guard.js.map