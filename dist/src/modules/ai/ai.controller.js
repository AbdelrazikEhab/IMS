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
import { Controller, Post, Get, Body, Param, Sse, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GenerateQuizDto, AIChatDto } from './dto/ai.dto';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
let AIController = class AIController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    generateQuiz(tenantId, user, dto) {
        return this.aiService.generateQuiz(tenantId, user.id, dto);
    }
    chat(tenantId, user, dto) {
        const generator = this.aiService.chatStream(tenantId, user.id, dto);
        return from(generator).pipe(map((content) => ({ data: content })));
    }
    getJobStatus(tenantId, id) {
        return this.aiService.getJobStatus(id, tenantId);
    }
    getStudentInsights(tenantId, studentId) {
        return this.aiService.getInsights(studentId, tenantId);
    }
};
__decorate([
    Post('quiz/generate'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN),
    ApiOperation({ summary: 'Generate a quiz for a lesson' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, GenerateQuizDto]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "generateQuiz", null);
__decorate([
    Sse('chat'),
    ApiOperation({ summary: 'Streaming AI chat response (SSE)' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, AIChatDto]),
    __metadata("design:returntype", Observable)
], AIController.prototype, "chat", null);
__decorate([
    Get('jobs/:id'),
    ApiOperation({ summary: 'Check AI job status' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "getJobStatus", null);
__decorate([
    Post('insights/student/:id'),
    Roles(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.PARENT),
    ApiOperation({ summary: 'Get AI insights on student performance' }),
    __param(0, TenantId()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "getStudentInsights", null);
AIController = __decorate([
    ApiTags('AI'),
    ApiBearerAuth(),
    Controller({ path: 'ai', version: '1' }),
    __metadata("design:paramtypes", [AIService])
], AIController);
export { AIController };
//# sourceMappingURL=ai.controller.js.map