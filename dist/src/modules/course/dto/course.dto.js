var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsEnum, IsUrl, MaxLength, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
export class CreateCourseDto {
    title;
    slug;
    description;
    thumbnailUrl;
    priceCents;
    currency;
    isFree;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "thumbnailUrl", void 0);
__decorate([
    ApiPropertyOptional({ default: 0, description: 'Price in cents' }),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "priceCents", void 0);
__decorate([
    ApiPropertyOptional({ default: 'EGP' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "isFree", void 0);
export class UpdateCourseDto {
    title;
    description;
    thumbnailUrl;
    priceCents;
    isFree;
    version;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], UpdateCourseDto.prototype, "thumbnailUrl", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "priceCents", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateCourseDto.prototype, "isFree", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Optimistic concurrency version' }),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateCourseDto.prototype, "version", void 0);
export class CreateModuleDto {
    title;
    orderIndex;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], CreateModuleDto.prototype, "title", void 0);
__decorate([
    ApiProperty(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "orderIndex", void 0);
export class ReorderModulesDto {
    order;
}
__decorate([
    ApiProperty({
        type: [String],
        description: 'Array of module IDs in new order',
    }),
    __metadata("design:type", Array)
], ReorderModulesDto.prototype, "order", void 0);
export class CreateLessonDto {
    title;
    contentType;
    contentUrl;
    orderIndex;
    durationSeconds;
    isPreview;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "title", void 0);
__decorate([
    ApiProperty({ enum: ContentType }),
    IsEnum(ContentType),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "contentType", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateLessonDto.prototype, "contentUrl", void 0);
__decorate([
    ApiProperty(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "orderIndex", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], CreateLessonDto.prototype, "durationSeconds", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreateLessonDto.prototype, "isPreview", void 0);
//# sourceMappingURL=course.dto.js.map