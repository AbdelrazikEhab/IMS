var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class RegisterTeacherDto {
    subdomain;
    platformName;
    email;
    password;
    firstName;
    lastName;
    phone;
    countryCode;
}
__decorate([
    ApiProperty({ example: 'ahmed' }),
    IsString(),
    MinLength(3),
    MaxLength(63),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "subdomain", void 0);
__decorate([
    ApiProperty({ example: 'Ahmed El-Sayed Academy' }),
    IsString(),
    MinLength(2),
    MaxLength(100),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "platformName", void 0);
__decorate([
    ApiProperty({ example: 'ahmed@example.com' }),
    IsEmail(),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'StrongPass123!' }),
    IsString(),
    MinLength(8),
    MaxLength(128),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ example: 'Ahmed' }),
    IsString(),
    MinLength(2),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "firstName", void 0);
__decorate([
    ApiProperty({ example: 'El-Sayed' }),
    IsString(),
    MinLength(2),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ example: '+201234567890' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "phone", void 0);
__decorate([
    ApiPropertyOptional({ example: 'EG' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterTeacherDto.prototype, "countryCode", void 0);
export class RegisterStudentDto {
    enrollmentCode;
    email;
    password;
    firstName;
    lastName;
    phone;
}
__decorate([
    ApiProperty({ example: 'ABC123XYZ' }),
    IsString(),
    MinLength(4),
    MaxLength(20),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "enrollmentCode", void 0);
__decorate([
    ApiProperty({ example: 'student@example.com' }),
    IsEmail(),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'StrongPass123!' }),
    IsString(),
    MinLength(8),
    MaxLength(128),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ example: 'Ali' }),
    IsString(),
    MinLength(2),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "firstName", void 0);
__decorate([
    ApiProperty({ example: 'Hassan' }),
    IsString(),
    MinLength(2),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "lastName", void 0);
__decorate([
    ApiPropertyOptional({ example: '+201234567890' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], RegisterStudentDto.prototype, "phone", void 0);
export class LoginDto {
    email;
    password;
    deviceFingerprint;
    deviceName;
}
__decorate([
    ApiProperty({ example: 'user@example.com' }),
    IsEmail(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'StrongPass123!' }),
    IsString(),
    MinLength(1),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    ApiPropertyOptional({
        description: 'Device fingerprint for session management',
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "deviceFingerprint", void 0);
__decorate([
    ApiPropertyOptional({ example: 'iPhone 14' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], LoginDto.prototype, "deviceName", void 0);
export class RefreshTokenDto {
    refreshToken;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
export class ForgotPasswordDto {
    email;
}
__decorate([
    ApiProperty({ example: 'user@example.com' }),
    IsEmail(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
export class ResetPasswordDto {
    email;
    otp;
    newPassword;
}
__decorate([
    ApiProperty(),
    IsEmail(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: '123456' }),
    IsString(),
    MinLength(6),
    MaxLength(6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otp", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(8),
    MaxLength(128),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
export class ChangePasswordDto {
    currentPassword;
    newPassword;
}
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    MinLength(8),
    MaxLength(128),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map