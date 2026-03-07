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
import { Controller, Post, Get, Patch, Delete, Body, Param, Req, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { RegisterTeacherDto, RegisterStudentDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, } from './dto/auth.dto';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async registerTeacher(dto) {
        return this.authService.registerTeacher(dto);
    }
    async registerStudent(dto, tenantId) {
        return this.authService.registerStudent(dto, tenantId);
    }
    async login(dto, tenantId, req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip ||
            '0.0.0.0';
        const userAgent = req.headers['user-agent'];
        return this.authService.login(dto, tenantId, ip, userAgent);
    }
    async refresh(dto) {
        return this.authService.refresh(dto.refreshToken);
    }
    async logout(user, dto) {
        return this.authService.logout(user.id, dto.refreshToken);
    }
    async getDevices(user) {
        return this.authService.getDevices(user.id);
    }
    async revokeDevice(user, deviceId) {
        return this.authService.revokeDevice(user.id, deviceId);
    }
    async forgotPassword(dto, tenantId) {
        return this.authService.forgotPassword(dto, tenantId);
    }
    async resetPassword(dto, tenantId) {
        return this.authService.resetPassword(dto, tenantId);
    }
    async changePassword(user, dto) {
        return this.authService.changePassword(user.id, dto);
    }
    async getMe(user, tenantId) {
        return this.authService.getMe(user.id, tenantId);
    }
};
__decorate([
    Public(),
    Post('register/teacher'),
    ApiOperation({
        summary: 'Register a new teacher and provision their platform',
    }),
    ApiResponse({ status: 201, description: 'Teacher registered' }),
    ApiResponse({ status: 409, description: 'Subdomain taken or email in use' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterTeacherDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerTeacher", null);
__decorate([
    Public(),
    Post('register/student'),
    ApiOperation({ summary: 'Register student with enrollment code' }),
    __param(0, Body()),
    __param(1, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterStudentDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerStudent", null);
__decorate([
    Public(),
    Post('login'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 10, ttl: 900000 } }),
    ApiOperation({ summary: 'Login and get access + refresh tokens' }),
    __param(0, Body()),
    __param(1, TenantId()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Public(),
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Rotate refresh token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    Post('logout'),
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Revoke refresh token' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    Get('devices'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'List active devices' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDevices", null);
__decorate([
    Delete('devices/:id'),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Revoke device session' }),
    __param(0, CurrentUser()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeDevice", null);
__decorate([
    Public(),
    Post('forgot-password'),
    HttpCode(HttpStatus.OK),
    Throttle({ default: { limit: 3, ttl: 3600000 } }),
    ApiOperation({ summary: 'Request password reset OTP' }),
    __param(0, Body()),
    __param(1, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    Public(),
    Post('reset-password'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Reset password with OTP' }),
    __param(0, Body()),
    __param(1, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    Patch('change-password'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Change password (authenticated)' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    Get('me'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user profile + tenant info' }),
    __param(0, CurrentUser()),
    __param(1, TenantId()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
AuthController = __decorate([
    ApiTags('Authentication'),
    Controller({ path: 'auth', version: '1' }),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map