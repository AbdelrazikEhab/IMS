import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Queue } from 'bullmq';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditQueue;
    constructor(auditQueue: Queue);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
