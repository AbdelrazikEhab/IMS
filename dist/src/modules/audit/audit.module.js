var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditProcessor } from './audit.processor';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
let AuditModule = class AuditModule {
};
AuditModule = __decorate([
    Global(),
    Module({
        imports: [
            BullModule.registerQueue({
                name: QUEUE_NAMES.AUDIT_LOG,
            }),
        ],
        controllers: [AuditController],
        providers: [AuditService, AuditProcessor],
        exports: [AuditService],
    })
], AuditModule);
export { AuditModule };
//# sourceMappingURL=audit.module.js.map