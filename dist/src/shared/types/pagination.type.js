var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CursorPaginationDto {
    cursor;
    limit = 20;
}
__decorate([
    ApiPropertyOptional({ description: 'Cursor from previous page' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CursorPaginationDto.prototype, "cursor", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Number of items per page', default: 20 }),
    IsOptional(),
    Transform(({ value }) => parseInt(value)),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], CursorPaginationDto.prototype, "limit", void 0);
export function encodeCursor(date, id) {
    return Buffer.from(JSON.stringify({ date: date.toISOString(), id })).toString('base64');
}
export function decodeCursor(cursor) {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
}
//# sourceMappingURL=pagination.type.js.map