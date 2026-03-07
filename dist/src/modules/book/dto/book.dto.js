var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsEnum, IsArray, IsUrl, MaxLength, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookType, PaymentGateway } from '@prisma/client';
export class CreateBookDto {
    title;
    slug;
    description;
    coverUrl;
    type;
    priceCents;
    currency;
    author;
    pages;
    language;
    tags;
    stockQuantity;
}
__decorate([
    ApiProperty(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], CreateBookDto.prototype, "title", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "slug", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUrl(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "coverUrl", void 0);
__decorate([
    ApiPropertyOptional({ enum: BookType, default: BookType.DIGITAL }),
    IsOptional(),
    IsEnum(BookType),
    __metadata("design:type", String)
], CreateBookDto.prototype, "type", void 0);
__decorate([
    ApiProperty({ description: 'Price in cents' }),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "priceCents", void 0);
__decorate([
    ApiPropertyOptional({ default: 'EGP' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "author", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "pages", void 0);
__decorate([
    ApiPropertyOptional({ default: 'ar' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateBookDto.prototype, "language", void 0);
__decorate([
    ApiPropertyOptional({ type: [String] }),
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], CreateBookDto.prototype, "tags", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], CreateBookDto.prototype, "stockQuantity", void 0);
export class UpdateBookDto {
    title;
    description;
    priceCents;
    isPublished;
    version;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(200),
    __metadata("design:type", String)
], UpdateBookDto.prototype, "title", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBookDto.prototype, "description", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], UpdateBookDto.prototype, "priceCents", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateBookDto.prototype, "isPublished", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsInt(),
    __metadata("design:type", Number)
], UpdateBookDto.prototype, "version", void 0);
export class PurchaseBookDto {
    gateway;
    quantity;
    idempotencyKey;
}
__decorate([
    ApiProperty({ enum: PaymentGateway }),
    IsEnum(PaymentGateway),
    __metadata("design:type", String)
], PurchaseBookDto.prototype, "gateway", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], PurchaseBookDto.prototype, "quantity", void 0);
__decorate([
    ApiProperty({ description: 'Idempotency key for safe retry' }),
    IsString(),
    __metadata("design:type", String)
], PurchaseBookDto.prototype, "idempotencyKey", void 0);
export class AddReviewDto {
    rating;
    comment;
}
__decorate([
    ApiProperty({ minimum: 1, maximum: 5 }),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], AddReviewDto.prototype, "rating", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    MaxLength(1000),
    __metadata("design:type", String)
], AddReviewDto.prototype, "comment", void 0);
//# sourceMappingURL=book.dto.js.map