import { CourseService } from './course.service';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto, ReorderModulesDto } from './dto/course.dto';
import { CursorPaginationDto } from '../../shared/types/pagination.type';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    list(tenantId: string, pagination: CursorPaginationDto): Promise<{
        data: {
            id: string;
            created_at: Date;
            _count: {
                enrollments: number;
                modules: number;
            };
            title: string;
            slug: string;
            currency: string;
            thumbnail_url: string | null;
            price_cents: number;
            is_published: boolean;
            is_free: boolean;
        }[];
        pagination: {
            nextCursor: string | null;
            hasMore: boolean;
        };
    }>;
    create(tenantId: string, user: AuthenticatedUser, dto: CreateCourseDto): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        title: string;
        teacher_id: string;
        version: number;
        slug: string;
        currency: string;
        thumbnail_url: string | null;
        price_cents: number;
        is_published: boolean;
        is_free: boolean;
    }>;
    findById(tenantId: string, id: string): Promise<{
        modules: ({
            lessons: {
                id: string;
                tenant_id: string;
                title: string;
                is_published: boolean;
                order_index: number;
                content_type: import("@prisma/client").$Enums.ContentType;
                content_url: string | null;
                duration_seconds: number | null;
                is_preview: boolean;
                module_id: string;
                video_id: string | null;
            }[];
        } & {
            id: string;
            tenant_id: string;
            title: string;
            is_published: boolean;
            order_index: number;
            course_id: string;
        })[];
    } & {
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        title: string;
        teacher_id: string;
        version: number;
        slug: string;
        currency: string;
        thumbnail_url: string | null;
        price_cents: number;
        is_published: boolean;
        is_free: boolean;
    }>;
    update(tenantId: string, id: string, dto: UpdateCourseDto): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        title: string;
        teacher_id: string;
        version: number;
        slug: string;
        currency: string;
        thumbnail_url: string | null;
        price_cents: number;
        is_published: boolean;
        is_free: boolean;
    }>;
    delete(tenantId: string, id: string): Promise<void>;
    publish(tenantId: string, id: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        title: string;
        teacher_id: string;
        version: number;
        slug: string;
        currency: string;
        thumbnail_url: string | null;
        price_cents: number;
        is_published: boolean;
        is_free: boolean;
    }>;
    unpublish(tenantId: string, id: string): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        description: string | null;
        title: string;
        teacher_id: string;
        version: number;
        slug: string;
        currency: string;
        thumbnail_url: string | null;
        price_cents: number;
        is_published: boolean;
        is_free: boolean;
    }>;
    duplicate(tenantId: string, id: string, user: AuthenticatedUser): Promise<{
        message: string;
        jobId: string | undefined;
    }>;
    addModule(tenantId: string, courseId: string, dto: CreateModuleDto): Promise<{
        id: string;
        tenant_id: string;
        title: string;
        is_published: boolean;
        order_index: number;
        course_id: string;
    }>;
    updateModule(tenantId: string, courseId: string, moduleId: string, dto: Partial<CreateModuleDto>): Promise<{
        id: string;
        tenant_id: string;
        title: string;
        is_published: boolean;
        order_index: number;
        course_id: string;
    }>;
    deleteModule(tenantId: string, courseId: string, moduleId: string): Promise<void>;
    reorderModules(tenantId: string, courseId: string, dto: ReorderModulesDto): Promise<{
        message: string;
    }>;
    addLesson(tenantId: string, courseId: string, moduleId: string, dto: CreateLessonDto): Promise<{
        id: string;
        tenant_id: string;
        title: string;
        is_published: boolean;
        order_index: number;
        content_type: import("@prisma/client").$Enums.ContentType;
        content_url: string | null;
        duration_seconds: number | null;
        is_preview: boolean;
        module_id: string;
        video_id: string | null;
    }>;
    updateLesson(tenantId: string, moduleId: string, lessonId: string, dto: Partial<CreateLessonDto>): Promise<{
        id: string;
        tenant_id: string;
        title: string;
        is_published: boolean;
        order_index: number;
        content_type: import("@prisma/client").$Enums.ContentType;
        content_url: string | null;
        duration_seconds: number | null;
        is_preview: boolean;
        module_id: string;
        video_id: string | null;
    }>;
    deleteLesson(tenantId: string, moduleId: string, lessonId: string): Promise<void>;
    getVideoUploadUrl(tenantId: string, lessonId: string, body: {
        filename: string;
    }): Promise<{
        uploadId: string;
        tusUrl: string;
        authorizationSignature: string;
        lessonId: string;
    }>;
    getStudents(tenantId: string, id: string): Promise<({
        student: {
            email: string;
            id: string;
            first_name: string;
            last_name: string;
            avatar_url: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        course_id: string;
        student_id: string;
        payment_id: string | null;
        enrolled_at: Date | null;
        activated_at: Date | null;
    })[]>;
    activateStudent(tenantId: string, courseId: string, studentId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        course_id: string;
        student_id: string;
        payment_id: string | null;
        enrolled_at: Date | null;
        activated_at: Date | null;
    }>;
    suspendStudent(tenantId: string, courseId: string, studentId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        course_id: string;
        student_id: string;
        payment_id: string | null;
        enrolled_at: Date | null;
        activated_at: Date | null;
    }>;
}
