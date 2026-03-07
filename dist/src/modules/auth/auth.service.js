var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, UnauthorizedException, ConflictException, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { DeviceService } from './device.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EnrollmentCodeExpiredException } from '../../shared/exceptions/enrollment-code-expired.exception';
let AuthService = class AuthService {
    prisma;
    tokenService;
    otpService;
    deviceService;
    constructor(prisma, tokenService, otpService, deviceService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
        this.otpService = otpService;
        this.deviceService = deviceService;
    }
    async registerTeacher(dto) {
        const existingTenant = await this.prisma.tenant.findFirst({
            where: { subdomain: dto.subdomain.toLowerCase() },
        });
        if (existingTenant) {
            throw new ConflictException('Subdomain is already taken');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const result = await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    subdomain: dto.subdomain.toLowerCase(),
                    name: dto.platformName,
                    country_code: dto.countryCode,
                    status: 'TRIAL',
                    plan: 'FREE',
                },
            });
            const user = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    role: UserRole.TEACHER,
                    email: dto.email.toLowerCase(),
                    password_hash: passwordHash,
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    phone: dto.phone,
                    is_active: true,
                    is_verified: false,
                },
            });
            return { tenant, user };
        });
        return {
            message: 'Teacher registered successfully',
            tenant: {
                id: result.tenant.id,
                subdomain: result.tenant.subdomain,
                name: result.tenant.name,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
        };
    }
    async registerStudent(dto, tenantId) {
        const code = await this.prisma.enrollmentCode.findFirst({
            where: {
                code: dto.enrollmentCode,
                tenant_id: tenantId,
                is_active: true,
            },
        });
        if (!code) {
            throw new EnrollmentCodeExpiredException('Invalid enrollment code');
        }
        if (code.expires_at && code.expires_at < new Date()) {
            throw new EnrollmentCodeExpiredException('Enrollment code has expired');
        }
        if (code.max_uses !== null && code.uses_count >= code.max_uses) {
            throw new EnrollmentCodeExpiredException('Enrollment code usage limit reached');
        }
        const existingUser = await this.prisma.user.findFirst({
            where: { tenant_id: tenantId, email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new ConflictException('Email already registered on this platform');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    tenant_id: tenantId,
                    role: UserRole.STUDENT,
                    email: dto.email.toLowerCase(),
                    password_hash: passwordHash,
                    first_name: dto.firstName,
                    last_name: dto.lastName,
                    phone: dto.phone,
                    is_active: true,
                },
            });
            await tx.enrollmentCode.update({
                where: { id: code.id },
                data: { uses_count: { increment: 1 } },
            });
            return user;
        });
        return {
            message: 'Student registered successfully',
            user: {
                id: result.id,
                email: result.email,
                role: result.role,
            },
        };
    }
    async login(dto, tenantId, ip, userAgent) {
        const user = await this.prisma.user.findFirst({
            where: { tenant_id: tenantId, email: dto.email.toLowerCase() },
            include: {
                tenant: { select: { id: true, subdomain: true, name: true } },
            },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        if (!user.is_active) {
            throw new ForbiddenException('Account is suspended');
        }
        const isValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const device = await this.deviceService.registerOrUpdateDevice(user.id, user.max_devices, dto.deviceFingerprint, dto.deviceName, userAgent, ip);
        const { accessToken, refreshToken } = await this.tokenService.generateTokenPair(user, device.id);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { last_login_at: new Date(), last_login_ip: ip },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                avatarUrl: user.avatar_url,
            },
            tenant: user.tenant,
        };
    }
    async refresh(refreshToken) {
        return this.tokenService.rotateRefreshToken(refreshToken);
    }
    async logout(userId, refreshToken) {
        await this.tokenService.revokeRefreshToken(userId, refreshToken);
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(dto, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { tenant_id: tenantId, email: dto.email.toLowerCase() },
        });
        if (!user) {
            return { message: 'If the email exists, an OTP has been sent' };
        }
        await this.otpService.sendOtp(user.id, dto.email, 'password_reset');
        return { message: 'If the email exists, an OTP has been sent' };
    }
    async resetPassword(dto, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { tenant_id: tenantId, email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.otpService.validateOtp(user.id, dto.otp, 'password_reset');
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password_hash: passwordHash },
        });
        await this.tokenService.revokeAllUserTokens(user.id);
        return { message: 'Password reset successfully' };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findFirst({ where: { id: userId } });
        if (!user)
            throw new NotFoundException('User not found');
        const isValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password_hash: passwordHash },
        });
        return { message: 'Password changed successfully' };
    }
    async getMe(userId, tenantId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenant_id: tenantId },
            include: {
                tenant: {
                    select: {
                        id: true,
                        subdomain: true,
                        name: true,
                        plan: true,
                        status: true,
                        primary_color: true,
                        logo_url: true,
                        landing_template: true,
                    },
                },
            },
        });
        if (!user)
            throw new NotFoundException('User not found');
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
    async getDevices(userId) {
        return this.deviceService.getUserDevices(userId);
    }
    async revokeDevice(userId, deviceId) {
        return this.deviceService.revokeDevice(userId, deviceId);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        TokenService,
        OtpService,
        DeviceService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map