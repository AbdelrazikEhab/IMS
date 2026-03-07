import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import { AuditService, AuditLogData } from './audit.service';
import { AuditEntity } from '@prisma/client';

@Processor(QUEUE_NAMES.AUDIT_LOG)
export class AuditProcessor extends WorkerHost {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  async process(job: Job<AuditLogData>): Promise<any> {
    if (job.name === 'log') {
      const { data } = job;

      // Determine entity type from URL if not provided
      let entityType = 'CONFIG';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const url = String((data as any).url || '');

      if (url.includes('/users')) {
        entityType = 'USER';
      } else if (url.includes('/courses')) {
        entityType = 'COURSE';
      } else if (url.includes('/books')) {
        entityType = 'BOOK';
      } else if (url.includes('/payments')) {
        entityType = 'PAYMENT';
      } else if (url.includes('/tenant')) {
        entityType = 'TENANT';
      }

      await this.auditService.log({
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entityType: entityType as AuditEntity,
      });
    }
  }
}
