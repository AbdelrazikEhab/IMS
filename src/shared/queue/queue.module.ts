import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
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
    BullModule.registerQueue(
      { name: QUEUE_NAMES.AUDIT_LOG },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.SMS },
      { name: QUEUE_NAMES.WHATSAPP },
      { name: QUEUE_NAMES.PUSH },
      { name: QUEUE_NAMES.VIDEO_PROCESSING },
      { name: QUEUE_NAMES.BOOK_PDF_WATERMARK },
      { name: QUEUE_NAMES.AI_JOBS },
      { name: QUEUE_NAMES.COURSE_DUPLICATE },
      { name: QUEUE_NAMES.AUDIT_EXPORT },
      { name: QUEUE_NAMES.PAYMENT },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
