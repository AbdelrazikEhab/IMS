import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditProcessor } from './audit.processor';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.AUDIT_LOG,
    }),
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditProcessor],
  exports: [AuditService],
})
export class AuditModule {}
