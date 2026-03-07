import { AuditService } from './audit.service';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    list(tenantId: string, pagination: CursorPaginationDto): Promise<{
        data: any[];
        pagination: {
            nextCursor: string | null;
            hasMore: boolean;
        };
    }>;
}
