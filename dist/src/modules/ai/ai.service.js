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
var AIService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import OpenAI from 'openai';
import { AIJobType, UploadStatus } from '@prisma/client';
let AIService = AIService_1 = class AIService {
    config;
    prisma;
    aiQueue;
    logger = new Logger(AIService_1.name);
    openai;
    constructor(config, prisma, aiQueue) {
        this.config = config;
        this.prisma = prisma;
        this.aiQueue = aiQueue;
        this.openai = new OpenAI({
            apiKey: this.config.get('OPENAI_API_KEY'),
        });
    }
    async generateQuiz(tenantId, userId, dto) {
        const jobRecord = await this.prisma.aIJob.create({
            data: {
                tenant_id: tenantId,
                user_id: userId,
                type: AIJobType.QUIZ_GENERATION,
                status: UploadStatus.PENDING,
                input: dto,
            },
        });
        await this.aiQueue.add('generate-quiz', {
            jobId: jobRecord.id,
            tenantId,
            userId,
            ...dto,
        });
        return { jobId: jobRecord.id, message: 'Quiz generation started' };
    }
    async *chatStream(tenantId, userId, dto) {
        const stream = await this.openai.chat.completions.create({
            model: this.config.get('OPENAI_MODEL', 'gpt-4o'),
            stream: true,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful AI tutor for an LMS platform.',
                },
                { role: 'user', content: dto.message },
            ],
            max_tokens: 1000,
        });
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content)
                yield content;
        }
    }
    async getJobStatus(jobId, tenantId) {
        const job = await this.prisma.aIJob.findFirst({
            where: { id: jobId, tenant_id: tenantId },
        });
        if (!job)
            throw new Error('Job not found');
        return job;
    }
    async getInsights(studentId, tenantId) {
        return {
            performance: 'Strong in mathematics, needs improvement in science vocabulary',
            recommendations: ['Watch Lesson 4 in Calculus', 'Try Quiz 2 in Physics'],
            predictedGrade: 'A-',
        };
    }
};
AIService = AIService_1 = __decorate([
    Injectable(),
    __param(2, InjectQueue(QUEUE_NAMES.AI_JOBS)),
    __metadata("design:paramtypes", [ConfigService,
        PrismaService,
        Queue])
], AIService);
export { AIService };
//# sourceMappingURL=ai.service.js.map