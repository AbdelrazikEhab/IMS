import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Queue } from 'bullmq';
import { GenerateQuizDto, AIChatDto } from './dto/ai.dto';
export declare class AIService {
    private readonly config;
    private readonly prisma;
    private readonly aiQueue;
    private readonly logger;
    private readonly openai;
    constructor(config: ConfigService, prisma: PrismaService, aiQueue: Queue);
    generateQuiz(tenantId: string, userId: string, dto: GenerateQuizDto): Promise<{
        jobId: string;
        message: string;
    }>;
    chatStream(tenantId: string, userId: string, dto: AIChatDto): AsyncGenerator<string, void, unknown>;
    getJobStatus(jobId: string, tenantId: string): Promise<{
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
    getInsights(studentId: string, tenantId: string): Promise<{
        performance: string;
        recommendations: string[];
        predictedGrade: string;
    }>;
}
