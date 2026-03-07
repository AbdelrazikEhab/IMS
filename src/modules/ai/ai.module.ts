import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.AI_JOBS,
    }),
  ],
  controllers: [AIController],
  providers: [AIService],
})
export class AIModule {}
