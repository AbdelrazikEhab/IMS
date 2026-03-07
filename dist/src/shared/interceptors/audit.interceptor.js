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
import { Injectable, } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { AuditAction } from '@prisma/client';
const METHOD_TO_ACTION = {
    POST: AuditAction.CREATE,
    PUT: AuditAction.UPDATE,
    PATCH: AuditAction.UPDATE,
    DELETE: AuditAction.DELETE,
};
const ALWAYS_LOG_PATTERNS = [
    { pattern: /\/auth\/login/, action: AuditAction.LOGIN },
    { pattern: /\/auth\/logout/, action: AuditAction.LOGOUT },
    { pattern: /\/payments/, action: AuditAction.PAYMENT },
    { pattern: /\/impersonate/, action: AuditAction.IMPERSONATE },
    { pattern: /\/features/, action: AuditAction.FEATURE_TOGGLE },
    { pattern: /\/export/, action: AuditAction.EXPORT },
];
let AuditInterceptor = class AuditInterceptor {
    auditQueue;
    constructor(auditQueue) {
        this.auditQueue = auditQueue;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        let action = METHOD_TO_ACTION[method];
        for (const { pattern, action: a } of ALWAYS_LOG_PATTERNS) {
            if (pattern.test(url)) {
                action = a;
                break;
            }
        }
        if (!action)
            return next.handle();
        return next.handle().pipe(tap((responseData) => {
            const user = request.user;
            const payload = {
                tenantId: request.tenantId,
                actorId: user?.id,
                actorRole: user?.role,
                action,
                ipAddress: headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    headers['x-real-ip'] ||
                    ip ||
                    '0.0.0.0',
                userAgent: headers['user-agent'],
                requestId: request.requestId,
                impersonatedBy: user?.impersonatedBy,
                newValues: responseData,
                url,
            };
            void this.auditQueue.add('log', payload, { priority: 10 });
        }));
    }
};
AuditInterceptor = __decorate([
    Injectable(),
    __param(0, InjectQueue(QUEUE_NAMES.AUDIT_LOG)),
    __metadata("design:paramtypes", [Queue])
], AuditInterceptor);
export { AuditInterceptor };
//# sourceMappingURL=audit.interceptor.js.map