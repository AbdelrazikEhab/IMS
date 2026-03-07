import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { UserRole } from '@prisma/client';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  CreateLessonDto,
  ReorderModulesDto,
} from './dto/course.dto';
import { CursorPaginationDto } from '../../shared/types/pagination.type';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller({ path: 'courses', version: '1' })
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List courses (cursor-paginated)' })
  list(@TenantId() tenantId: string, @Query() pagination: CursorPaginationDto) {
    return this.courseService.list(tenantId, pagination);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create course' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.create(tenantId, user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course with modules and lessons' })
  findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.courseService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update course (optimistic concurrency)' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Soft delete course' })
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.courseService.delete(tenantId, id);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Publish course' })
  publish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.courseService.publish(tenantId, id);
  }

  @Post(':id/unpublish')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Unpublish course' })
  unpublish(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.courseService.unpublish(tenantId, id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Duplicate course (BullMQ job)' })
  duplicate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.courseService.duplicate(tenantId, id, user.id);
  }

  // ── MODULES ──

  @Post(':id/modules')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Add module to course' })
  addModule(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.courseService.addModule(tenantId, courseId, dto);
  }

  @Patch(':id/modules/:moduleId')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update module' })
  updateModule(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: Partial<CreateModuleDto>,
  ) {
    return this.courseService.updateModule(tenantId, courseId, moduleId, dto);
  }

  @Delete(':id/modules/:moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete module' })
  deleteModule(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.courseService.deleteModule(tenantId, courseId, moduleId);
  }

  @Post(':id/modules/reorder')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Reorder modules' })
  reorderModules(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Body() dto: ReorderModulesDto,
  ) {
    return this.courseService.reorderModules(tenantId, courseId, dto);
  }

  // ── LESSONS ──

  @Post(':id/modules/:moduleId/lessons')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Add lesson to module' })
  addLesson(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.courseService.addLesson(tenantId, courseId, moduleId, dto);
  }

  @Patch(':id/modules/:moduleId/lessons/:lessonId')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update lesson' })
  updateLesson(
    @TenantId() tenantId: string,
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: Partial<CreateLessonDto>,
  ) {
    return this.courseService.updateLesson(tenantId, moduleId, lessonId, dto);
  }

  @Delete(':id/modules/:moduleId/lessons/:lessonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete lesson' })
  deleteLesson(
    @TenantId() tenantId: string,
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.courseService.deleteLesson(tenantId, moduleId, lessonId);
  }

  @Post(':id/modules/:moduleId/lessons/:lessonId/video')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get TUS video upload URL (Bunny.net)' })
  getVideoUploadUrl(
    @TenantId() tenantId: string,
    @Param('lessonId') lessonId: string,
    @Body() body: { filename: string },
  ) {
    return this.courseService.getVideoUploadUrl(
      tenantId,
      lessonId,
      body.filename,
    );
  }

  // ── STUDENTS ──

  @Get(':id/students')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'List enrolled students with progress' })
  getStudents(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.courseService.getEnrolledStudents(tenantId, id);
  }

  @Post(':id/students/:sid/activate')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Manually activate student enrollment' })
  activateStudent(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Param('sid') studentId: string,
  ) {
    return this.courseService.activateStudent(tenantId, courseId, studentId);
  }

  @Post(':id/students/:sid/suspend')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Suspend student enrollment' })
  suspendStudent(
    @TenantId() tenantId: string,
    @Param('id') courseId: string,
    @Param('sid') studentId: string,
  ) {
    return this.courseService.suspendStudent(tenantId, courseId, studentId);
  }
}
