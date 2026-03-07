var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import { AuditService } from './audit.service';
let AuditProcessor = class AuditProcessor extends WorkerHost {
    auditService;
    constructor(auditService) {
        super();
        this.auditService = auditService;
    }
    async process(job) {
        if (job.name === 'log') {
            const { data } = job;
            let entityType = 'CONFIG';
            const url = String(data.url || '');
            if (url.includes('/users')) {
                entityType = 'USER';
            }
            else if (url.includes('/courses')) {
                entityType = 'COURSE';
            }
            else if (url.includes('/books')) {
                entityType = 'BOOK';
            }
            else if (url.includes('/payments')) {
                entityType = 'PAYMENT';
            }
            else if (url.includes('/tenant')) {
                entityType = 'TENANT';
            }
            await this.auditService.log({
                ...data,
                entityType: entityType,
            });
        }
    }
};
AuditProcessor = __decorate([
    Processor(QUEUE_NAMES.AUDIT_LOG),
    __metadata("design:paramtypes", [AuditService])
], AuditProcessor);
export { AuditProcessor };
//# sourceMappingURL=audit.processor.js.map