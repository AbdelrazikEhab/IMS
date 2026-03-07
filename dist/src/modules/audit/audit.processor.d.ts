import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditService, AuditLogData } from './audit.service';
export declare class AuditProcessor extends WorkerHost {
    private readonly auditService;
    constructor(auditService: AuditService);
    process(job: Job<AuditLogData>): Promise<any>;
}
