import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  CreateLessonDto,
  ReorderModulesDto,
} from './dto/course.dto';
import {
  CursorPaginationDto,
  decodeCursor,
  encodeCursor,
} from '../../shared/types/pagination.type';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.COURSE_DUPLICATE)
    private readonly courseQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VIDEO_PROCESSING)
    private readonly videoQueue: Queue,
  ) {}

  async list(tenantId: string, pagination: CursorPaginationDto) {
    const limit = pagination.limit ?? 20;
    const where: Record<string, unknown> = { tenant_id: tenantId };

    if (pagination.cursor) {
      const { date, id } = decodeCursor(pagination.cursor);
      where['OR'] = [
        { created_at: { lt: new Date(date) } },
        { created_at: new Date(date), id: { lt: id } },
      ];
    }

    const courses = await this.prisma.course.findMany({
      where,
      take: limit + 1,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail_url: true,
        price_cents: true,
        currency: true,
        is_published: true,
        is_free: true,
        created_at: true,
        _count: { select: { modules: true, enrollments: true } },
      },
    });

    const hasMore = courses.length > limit;
    const items = hasMore ? courses.slice(0, limit) : courses;
    const lastItem = items[items.length - 1];

    return {
      data: items,
      pagination: {
        nextCursor:
          hasMore && lastItem
            ? encodeCursor(lastItem.created_at, lastItem.id)
            : null,
        hasMore,
      },
    };
  }

  async create(tenantId: string, teacherId: string, dto: CreateCourseDto) {
    const existing = await this.prisma.course.findFirst({
      where: { tenant_id: tenantId, slug: dto.slug },
    });
    if (existing) throw new ConflictException('Course slug already exists');

    return this.prisma.course.create({
      data: {
        tenant_id: tenantId,
        teacher_id: teacherId,
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        thumbnail_url: dto.thumbnailUrl,
        price_cents: dto.priceCents ?? 0,
        currency: dto.currency ?? 'EGP',
        is_free: dto.isFree ?? false,
      },
    });
  }

  async findById(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
      include: {
        modules: {
          orderBy: { order_index: 'asc' },
          include: {
            lessons: {
              orderBy: { order_index: 'asc' },
            },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(tenantId: string, courseId: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // Optimistic concurrency check
    if (dto.version !== undefined && course.version !== dto.version) {
      throw new ConflictException(
        'Course was modified by another request. Please refresh and try again.',
      );
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        description: dto.description,
        thumbnail_url: dto.thumbnailUrl,
        price_cents: dto.priceCents,
        is_free: dto.isFree,
        version: { increment: 1 },
      },
    });
  }

  async delete(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
    });
    if (!course) throw new NotFoundException('Course not found');

    await this.prisma.course.update({
      where: { id: courseId },
      data: { deleted_at: new Date() },
    });
  }

  async publish(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id: courseId },
      data: { is_published: true },
    });
  }

  async unpublish(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id: courseId },
      data: { is_published: false },
    });
  }

  async duplicate(tenantId: string, courseId: string, requesterId: string) {
    const course = await this.findById(tenantId, courseId);
    const job = await this.courseQueue.add('duplicate', {
      courseId,
      tenantId,
      requesterId,
    });
    return { message: 'Course duplication started', jobId: job.id };
  }

  // ── MODULES ──

  async addModule(tenantId: string, courseId: string, dto: CreateModuleDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenant_id: tenantId },
    });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.courseModule.create({
      data: {
        course_id: courseId,
        tenant_id: tenantId,
        title: dto.title,
        order_index: dto.orderIndex,
      },
    });
  }

  async updateModule(
    tenantId: string,
    courseId: string,
    moduleId: string,
    dto: Partial<CreateModuleDto>,
  ) {
    const mod = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, course_id: courseId, tenant_id: tenantId },
    });
    if (!mod) throw new NotFoundException('Module not found');

    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: { title: dto.title, order_index: dto.orderIndex },
    });
  }

  async deleteModule(tenantId: string, courseId: string, moduleId: string) {
    const mod = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, course_id: courseId, tenant_id: tenantId },
    });
    if (!mod) throw new NotFoundException('Module not found');
    await this.prisma.courseModule.delete({ where: { id: moduleId } });
  }

  async reorderModules(
    tenantId: string,
    courseId: string,
    dto: ReorderModulesDto,
  ) {
    const updates = dto.order.map((moduleId, index) =>
      this.prisma.courseModule.updateMany({
        where: { id: moduleId, course_id: courseId, tenant_id: tenantId },
        data: { order_index: index },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Modules reordered successfully' };
  }

  // ── LESSONS ──

  async addLesson(
    tenantId: string,
    courseId: string,
    moduleId: string,
    dto: CreateLessonDto,
  ) {
    const mod = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, course_id: courseId, tenant_id: tenantId },
    });
    if (!mod) throw new NotFoundException('Module not found');

    return this.prisma.lesson.create({
      data: {
        module_id: moduleId,
        tenant_id: tenantId,
        title: dto.title,
        content_type: dto.contentType,
        content_url: dto.contentUrl,
        order_index: dto.orderIndex,
        duration_seconds: dto.durationSeconds,
        is_preview: dto.isPreview ?? false,
      },
    });
  }

  async updateLesson(
    tenantId: string,
    moduleId: string,
    lessonId: string,
    dto: Partial<CreateLessonDto>,
  ) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, module_id: moduleId, tenant_id: tenantId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        content_type: dto.contentType,
        content_url: dto.contentUrl,
        order_index: dto.orderIndex,
        duration_seconds: dto.durationSeconds,
        is_preview: dto.isPreview,
      },
    });
  }

  async deleteLesson(tenantId: string, moduleId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, module_id: moduleId, tenant_id: tenantId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  async getVideoUploadUrl(
    tenantId: string,
    lessonId: string,
    filename: string,
  ) {
    // In production: call Bunny.net API to create video + get TUS upload URL
    const uploadId = `upload_${Date.now()}`;

    await this.prisma.videoUpload.create({
      data: {
        tenant_id: tenantId,
        user_id: 'system',
        filename,
        filesize_bytes: 0n,
        mime_type: 'video/mp4',
        status: 'PENDING',
      },
    });

    return {
      uploadId,
      tusUrl: `https://video.bunnycdn.com/tusupload`,
      authorizationSignature: 'BUNNY_SIGNATURE_PLACEHOLDER',
      lessonId,
    };
  }

  async getEnrolledStudents(tenantId: string, courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { tenant_id: tenantId, course_id: courseId },
      include: {
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async activateStudent(tenantId: string, courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        tenant_id: tenantId,
        course_id: courseId,
        student_id: studentId,
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'ACTIVE', activated_at: new Date() },
    });
  }

  async suspendStudent(tenantId: string, courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        tenant_id: tenantId,
        course_id: courseId,
        student_id: studentId,
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'SUSPENDED' },
    });
  }
}
