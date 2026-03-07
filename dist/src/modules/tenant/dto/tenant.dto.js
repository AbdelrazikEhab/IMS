var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsHexColor, IsInt, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateBrandingDto {
    logoUrl;
    faviconUrl;
    primaryColor;
    secondaryColor;
    landingTemplate;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "logoUrl", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "faviconUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: '#2563EB' }),
    IsOptional(),
    IsHexColor(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "primaryColor", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsHexColor(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "secondaryColor", void 0);
__decorate([
    ApiPropertyOptional({ enum: ['classic', 'modern', 'minimal'] }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "landingTemplate", void 0);
export class UpdateTenantSettingsDto {
    timezone;
    locale;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "timezone", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateTenantSettingsDto.prototype, "locale", void 0);
export class CreateEnrollmentCodeDto {
    maxUses;
    expiresAt;
}
__decorate([
    ApiPropertyOptional({ description: 'Max number of uses (null = unlimited)' }),
    IsOptional(),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], CreateEnrollmentCodeDto.prototype, "maxUses", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Expiry date (ISO8601)' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateEnrollmentCodeDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=tenant.dto.js.map