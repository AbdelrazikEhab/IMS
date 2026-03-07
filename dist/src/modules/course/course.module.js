var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
let CourseModule = class CourseModule {
};
CourseModule = __decorate([
    Module({
        imports: [
            BullModule.registerQueue({ name: QUEUE_NAMES.COURSE_DUPLICATE }, { name: QUEUE_NAMES.VIDEO_PROCESSING }),
        ],
        controllers: [CourseController],
        providers: [CourseService],
        exports: [CourseService],
    })
], CourseModule);
export { CourseModule };
//# sourceMappingURL=course.module.js.map