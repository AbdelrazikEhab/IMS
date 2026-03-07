import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { AppRequest } from '../types/request.type';
import { AuditAction } from '@prisma/client';

const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

// Routes that always get logged regardless of method
const ALWAYS_LOG_PATTERNS = [
  { pattern: /\/auth\/login/, action: AuditAction.LOGIN },
  { pattern: /\/auth\/logout/, action: AuditAction.LOGOUT },
  { pattern: /\/payments/, action: AuditAction.PAYMENT },
  { pattern: /\/impersonate/, action: AuditAction.IMPERSONATE },
  { pattern: /\/features/, action: AuditAction.FEATURE_TOGGLE },
  { pattern: /\/export/, action: AuditAction.EXPORT },
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectQueue(QUEUE_NAMES.AUDIT_LOG) private readonly auditQueue: Queue,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AppRequest>();
    const { method, url, ip, headers } = request;

    let action = METHOD_TO_ACTION[method];

    // Check for special route patterns
    for (const { pattern, action: a } of ALWAYS_LOG_PATTERNS) {
      if (pattern.test(url)) {
        action = a;
        break;
      }
    }

    // Only log mutating methods
    if (!action) return next.handle();

    return next.handle().pipe(
      tap((responseData) => {
        const user = request.user;
        const payload = {
          tenantId: request.tenantId,
          actorId: user?.id,
          actorRole: user?.role,
          action,
          ipAddress:
            (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            (headers['x-real-ip'] as string) ||
            ip ||
            '0.0.0.0',
          userAgent: headers['user-agent'],
          requestId: request.requestId,
          impersonatedBy: user?.impersonatedBy,
          newValues: responseData,
          url,
        };

        // Fire and forget — non-blocking
        void this.auditQueue.add('log', payload, { priority: 10 });
      }),
    );
  }
}
