import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.COURSE_DUPLICATE },
      { name: QUEUE_NAMES.VIDEO_PROCESSING },
    ),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
