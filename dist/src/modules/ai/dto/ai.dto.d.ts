import { AIJobType } from '@prisma/client';
export declare class GenerateQuizDto {
    lessonId: string;
    questionCount: number;
    difficulty?: string;
}
export declare class AIChatDto {
    message: string;
    context?: {
        courseId?: string;
        lessonId?: string;
    };
}
export declare class GenerateContentDto {
    lessonId: string;
    type: AIJobType;
}
