var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto, ReorderModulesDto, } from './dto/course.dto';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
let CourseController = class CourseController {
    courseService;
    constructor(courseService) {
        this.courseService = courseService;
    }
    list(tenantId, pagination) {
        return this.courseService.list(tenantId, pagination);
    }
    create(tenantId, user, dto) {
        return this.courseService.create(tenantId, user.id, dto);
    }
    findById(tenantId, id) {
        return this.courseService.findById(tenantId, id);
    }
    update(tenantId, id, dto) {
        return this.courseService.update(tenantId, id, dto);
    }
    delete(tenantId, id) {
        return this.courseService.delete(tenantId, id);
    }
    publish(tenantId, id) {
        return this.courseService.publish(tenantId, id);
    }
    unpublish(tenantId, id) {
        return this.courseService.unpublish(tenantId, id);
    }
    duplicate(tenantId, id, user) {
        return this.courseService.duplicate(tenantId, id, user.id);
    }
    addModule(tenantId, courseId, dto) {
        return this.courseService.addModule(tenantId, courseId, dto);
    }
    updateModule(tenantId, courseId, moduleId, dto) {
        return this.courseService.updateModule(tenantId, courseId, moduleId, dto);
    }
    deleteModule(tenantId, courseId, moduleId) {
        return this.courseService.deleteModule(tenantId, courseId, moduleId);
    }
    reorderModules(tenantId, courseId, dto) {
        return this.courseService.reorderModules(tenantId, courseId, dto);
    }
    addLesson(tenantId, courseId, moduleId, dto) {
        return this.courseService.addLesson(tenantId, courseId, moduleId, dto);
    }
    updateLesson(tenantId, moduleId, lessonId, dto) {
        return this.courseService.updateLesson(tenantId, moduleId, lessonId, dto);
    }
    deleteLesson(tenantId, moduleId, lessonId) {
        return this.courseService.deleteLesson(tenantId, moduleId, lessonId);
    }
    getVideoUploadUrl(tenantId, lessonId, body) {
        return this.courseService.getVideoUploadUrl(tenantId, lessonId, body.filename);
    }
    getStudents(tenantId, id) {
        return this.courseService.getEnrolledStudents(tenantId, id);
    }
    activateStudent(tenantId, courseId, studentId) {
        return this.courseService.activateStudent(tenantId, courseId, studentId);
    }
    suspendStudent(tenantId, courseId, studentId) {
        return this.courseService.suspendStudent(tenantId, courseId, studentId);
    }
};
__decorate([
    Get(),
    ApiOperation({ summary: 'List courses (cursor-paginated)' }),
    __param(0, TenantId()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CursorPaginationDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "list", null);
__decorate([
    Post(),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Create course' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, CreateCourseDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "create", null);
__decorate([
    Get(':id'),
    ApiOperation({ summary: 'Get course with modules and lessons' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "findById", null);
__decorate([
    Patch(':id'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update course (optimistic concurrency)' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateCourseDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "update", null);
__decorate([
    Delete(':id'),
    HttpCode(HttpStatus.NO_CONTENT),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Soft delete course' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "delete", null);
__decorate([
    Post(':id/publish'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Publish course' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "publish", null);
__decorate([
    Post(':id/unpublish'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Unpublish course' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "unpublish", null);
__decorate([
    Post(':id/duplicate'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Duplicate course (BullMQ job)' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "duplicate", null);
__decorate([
    Post(':id/modules'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Add module to course' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, CreateModuleDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "addModule", null);
__decorate([
    Patch(':id/modules/:moduleId'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update module' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Param('moduleId')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "updateModule", null);
__decorate([
    Delete(':id/modules/:moduleId'),
    HttpCode(HttpStatus.NO_CONTENT),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Delete module' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Param('moduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "deleteModule", null);
__decorate([
    Post(':id/modules/reorder'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Reorder modules' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ReorderModulesDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "reorderModules", null);
__decorate([
    Post(':id/modules/:moduleId/lessons'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Add lesson to module' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Param('moduleId')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, CreateLessonDto]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "addLesson", null);
__decorate([
    Patch(':id/modules/:moduleId/lessons/:lessonId'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Update lesson' }),
    __param(0, TenantId()),
    __param(1, Param('moduleId')),
    __param(2, Param('lessonId')),
    __param(3, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "updateLesson", null);
__decorate([
    Delete(':id/modules/:moduleId/lessons/:lessonId'),
    HttpCode(HttpStatus.NO_CONTENT),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Delete lesson' }),
    __param(0, TenantId()),
    __param(1, Param('moduleId')),
    __param(2, Param('lessonId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "deleteLesson", null);
__decorate([
    Post(':id/modules/:moduleId/lessons/:lessonId/video'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Get TUS video upload URL (Bunny.net)' }),
    __param(0, TenantId()),
    __param(1, Param('lessonId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getVideoUploadUrl", null);
__decorate([
    Get(':id/students'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'List enrolled students with progress' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "getStudents", null);
__decorate([
    Post(':id/students/:sid/activate'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Manually activate student enrollment' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Param('sid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "activateStudent", null);
__decorate([
    Post(':id/students/:sid/suspend'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Suspend student enrollment' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __param(2, Param('sid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CourseController.prototype, "suspendStudent", null);
CourseController = __decorate([
    ApiTags('Courses'),
    ApiBearerAuth(),
    Controller({ path: 'courses', version: '1' }),
    __metadata("design:paramtypes", [CourseService])
], CourseController);
export { CourseController };
//# sourceMappingURL=course.controller.js.map