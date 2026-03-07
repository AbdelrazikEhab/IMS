var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsInt, Min, Max, IsOptional, IsUUID, IsEnum, } from 'class-validator';
import { AIJobType } from '@prisma/client';
export class GenerateQuizDto {
    lessonId;
    questionCount = 5;
    difficulty = 'intermediate';
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "lessonId", void 0);
__decorate([
    IsInt(),
    Min(1),
    Max(50),
    __metadata("design:type", Number)
], GenerateQuizDto.prototype, "questionCount", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "difficulty", void 0);
export class AIChatDto {
    message;
    context;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], AIChatDto.prototype, "message", void 0);
__decorate([
    IsOptional(),
    __metadata("design:type", Object)
], AIChatDto.prototype, "context", void 0);
export class GenerateContentDto {
    lessonId;
    type;
}
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "lessonId", void 0);
__decorate([
    IsEnum(AIJobType),
    __metadata("design:type", String)
], GenerateContentDto.prototype, "type", void 0);
//# sourceMappingURL=ai.dto.js.map