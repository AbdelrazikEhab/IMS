import { ContentType } from '@prisma/client';
export declare class CreateCourseDto {
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    priceCents?: number;
    currency?: string;
    isFree?: boolean;
}
export declare class UpdateCourseDto {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    priceCents?: number;
    isFree?: boolean;
    version?: number;
}
export declare class CreateModuleDto {
    title: string;
    orderIndex: number;
}
export declare class ReorderModulesDto {
    order: string[];
}
export declare class CreateLessonDto {
    title: string;
    contentType: ContentType;
    contentUrl?: string;
    orderIndex: number;
    durationSeconds?: number;
    isPreview?: boolean;
}
