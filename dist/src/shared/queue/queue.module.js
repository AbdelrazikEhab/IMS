var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
let QueueModule = class QueueModule {
};
QueueModule = __decorate([
    Global(),
    Module({
        imports: [
            BullModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: (config) => ({
                    connection: {
                        url: config.get('REDIS_URL', 'redis://localhost:6379'),
                    },
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 1000 },
                        removeOnComplete: 100,
                        removeOnFail: 500,
                    },
                }),
                inject: [ConfigService],
            }),
            BullModule.registerQueue({ name: QUEUE_NAMES.AUDIT_LOG }, { name: QUEUE_NAMES.EMAIL }, { name: QUEUE_NAMES.SMS }, { name: QUEUE_NAMES.WHATSAPP }, { name: QUEUE_NAMES.PUSH }, { name: QUEUE_NAMES.VIDEO_PROCESSING }, { name: QUEUE_NAMES.BOOK_PDF_WATERMARK }, { name: QUEUE_NAMES.AI_JOBS }, { name: QUEUE_NAMES.COURSE_DUPLICATE }, { name: QUEUE_NAMES.AUDIT_EXPORT }, { name: QUEUE_NAMES.PAYMENT }),
        ],
        exports: [BullModule],
    })
], QueueModule);
export { QueueModule };
//# sourceMappingURL=queue.module.js.map