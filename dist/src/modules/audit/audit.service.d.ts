import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditAction, AuditEntity, UserRole } from '@prisma/client';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
export interface AuditLogData {
    tenantId?: string;
    actorId?: string;
    actorRole?: UserRole;
    action: AuditAction;
    entityType: AuditEntity;
    entityId?: string;
    url?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress: string;
    userAgent?: string;
    requestId?: string;
    impersonatedBy?: string;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<any>;
    list(tenantId: string | null, pagination: CursorPaginationDto): Promise<{
        data: any[];
        pagination: {
            nextCursor: string | null;
            hasMore: boolean;
        };
    }>;
}
