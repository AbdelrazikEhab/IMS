import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Sse,
  UseGuards,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { GenerateQuizDto, AIChatDto } from './dto/ai.dto';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@ApiTags('AI')
@ApiBearerAuth()
@Controller({ path: 'ai', version: '1' })
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('quiz/generate')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Generate a quiz for a lesson' })
  generateQuiz(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateQuizDto,
  ) {
    return this.aiService.generateQuiz(tenantId, user.id, dto);
  }

  @Sse('chat')
  @ApiOperation({ summary: 'Streaming AI chat response (SSE)' })
  chat(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AIChatDto,
  ): Observable<MessageEvent> {
    const generator = this.aiService.chatStream(tenantId, user.id, dto);
    return from(generator).pipe(
      map((content) => ({ data: content }) as MessageEvent),
    );
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Check AI job status' })
  getJobStatus(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.aiService.getJobStatus(id, tenantId);
  }

  @Post('insights/student/:id')
  @Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.PARENT)
  @ApiOperation({ summary: 'Get AI insights on student performance' })
  getStudentInsights(
    @TenantId() tenantId: string,
    @Param('id') studentId: string,
  ) {
    return this.aiService.getInsights(studentId, tenantId);
  }
}
