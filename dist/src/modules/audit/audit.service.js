var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { decodeCursor, encodeCursor, } from '../../shared/types/pagination.type';
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    tenant_id: data.tenantId,
                    actor_id: data.actorId,
                    actor_role: data.actorRole,
                    action: data.action,
                    entity_type: data.entityType,
                    entity_id: data.entityId,
                    old_values: data.oldValues,
                    new_values: data.newValues,
                    metadata: data.metadata,
                    ip_address: data.ipAddress,
                    user_agent: data.userAgent,
                    request_id: data.requestId,
                    impersonated_by: data.impersonatedBy,
                },
            });
        }
        catch (error) {
            const message = error?.message || String(error);
            const stack = error?.stack;
            this.logger.error(`Failed to write audit log: ${message}`, stack);
        }
    }
    async list(tenantId, pagination) {
        const limit = pagination.limit ?? 50;
        const where = {};
        if (tenantId) {
            where.tenant_id = tenantId;
        }
        if (pagination.cursor) {
            const { date, id } = decodeCursor(pagination.cursor);
            where.OR = [
                { created_at: { lt: new Date(date) } },
                { created_at: new Date(date), id: { lt: id } },
            ];
        }
        const logs = (await this.prisma.auditLog.findMany({
            where,
            take: limit + 1,
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            include: {
                actor: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
        }));
        const hasMore = logs.length > limit;
        const items = hasMore ? logs.slice(0, limit) : logs;
        const lastItem = items[items.length - 1];
        return {
            data: items,
            pagination: {
                nextCursor: hasMore && lastItem
                    ? encodeCursor(lastItem.created_at, lastItem.id)
                    : null,
                hasMore,
            },
        };
    }
};
AuditService = AuditService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], AuditService);
export { AuditService };
//# sourceMappingURL=audit.service.js.map