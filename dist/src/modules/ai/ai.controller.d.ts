import type { MessageEvent } from '@nestjs/common';
import { AIService } from './ai.service';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { GenerateQuizDto, AIChatDto } from './dto/ai.dto';
import { Observable } from 'rxjs';
export declare class AIController {
    private readonly aiService;
    constructor(aiService: AIService);
    generateQuiz(tenantId: string, user: AuthenticatedUser, dto: GenerateQuizDto): Promise<{
        jobId: string;
        message: string;
    }>;
    chat(tenantId: string, user: AuthenticatedUser, dto: AIChatDto): Observable<MessageEvent>;
    getJobStatus(tenantId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.AIJobType;
        id: string;
        status: import("@prisma/client").$Enums.UploadStatus;
        tenant_id: string;
        created_at: Date;
        user_id: string;
        error_message: string | null;
        input: import("@prisma/client/runtime/client").JsonValue;
        output: import("@prisma/client/runtime/client").JsonValue | null;
        tokens_used: number | null;
        completed_at: Date | null;
    }>;
    getStudentInsights(tenantId: string, studentId: string): Promise<{
        performance: string;
        recommendations: string[];
        predictedGrade: string;
    }>;
}
