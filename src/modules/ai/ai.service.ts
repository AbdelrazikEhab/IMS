import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '../../shared/queue/queue.constants';
import OpenAI from 'openai';
import { AIJobType, UploadStatus } from '@prisma/client';
import { GenerateQuizDto, AIChatDto } from './dto/ai.dto';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.AI_JOBS) private readonly aiQueue: Queue,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateQuiz(tenantId: string, userId: string, dto: GenerateQuizDto) {
    // Create AI job in DB
    const jobRecord = await this.prisma.aIJob.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        type: AIJobType.QUIZ_GENERATION,
        status: UploadStatus.PENDING,
        input: dto as any,
      },
    });

    // Add to BullMQ
    await this.aiQueue.add('generate-quiz', {
      jobId: jobRecord.id,
      tenantId,
      userId,
      ...dto,
    });

    return { jobId: jobRecord.id, message: 'Quiz generation started' };
  }

  async *chatStream(tenantId: string, userId: string, dto: AIChatDto) {
    const stream = await this.openai.chat.completions.create({
      model: this.config.get<string>('OPENAI_MODEL', 'gpt-4o'),
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
      if (content) yield content;
    }
  }

  async getJobStatus(jobId: string, tenantId: string) {
    const job = await this.prisma.aIJob.findFirst({
      where: { id: jobId, tenant_id: tenantId },
    });
    if (!job) throw new Error('Job not found');
    return job;
  }

  async getInsights(studentId: string, tenantId: string) {
    // Mock insights for now
    return {
      performance:
        'Strong in mathematics, needs improvement in science vocabulary',
      recommendations: ['Watch Lesson 4 in Calculus', 'Try Quiz 2 in Physics'],
      predictedGrade: 'A-',
    };
  }
}
