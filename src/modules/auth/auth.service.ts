import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { DeviceService } from './device.service';
import {
  RegisterTeacherDto,
  RegisterStudentDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EnrollmentCodeExpiredException } from '../../shared/exceptions/enrollment-code-expired.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly deviceService: DeviceService,
  ) {}

  async registerTeacher(dto: RegisterTeacherDto) {
    // Check subdomain availability
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { subdomain: dto.subdomain.toLowerCase() },
    });
    if (existingTenant) {
      throw new ConflictException('Subdomain is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create tenant + teacher in a transaction
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

  async registerStudent(dto: RegisterStudentDto, tenantId: string) {
    // Validate enrollment code
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
      throw new EnrollmentCodeExpiredException(
        'Enrollment code usage limit reached',
      );
    }

    // Check email uniqueness within tenant
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

      // Increment enrollment code usage
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

  async login(dto: LoginDto, tenantId: string, ip: string, userAgent?: string) {
    // Check login rate limit (Redis-based — handled by ThrottlerGuard at route level)
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

    // Handle device
    const device = await this.deviceService.registerOrUpdateDevice(
      user.id,
      user.max_devices,
      dto.deviceFingerprint,
      dto.deviceName,
      userAgent,
      ip,
    );

    // Generate tokens
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokenPair(user, device.id);

    // Update last login
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

  async refresh(refreshToken: string) {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  async logout(userId: string, refreshToken: string) {
    await this.tokenService.revokeRefreshToken(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { tenant_id: tenantId, email: dto.email.toLowerCase() },
    });

    if (!user) {
      // Return success even if user not found (security: don't leak existence)
      return { message: 'If the email exists, an OTP has been sent' };
    }

    await this.otpService.sendOtp(user.id, dto.email, 'password_reset');

    return { message: 'If the email exists, an OTP has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto, tenantId: string) {
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

    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
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

  async getMe(userId: string, tenantId: string) {
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

    if (!user) throw new NotFoundException('User not found');

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async getDevices(userId: string) {
    return this.deviceService.getUserDevices(userId);
  }

  async revokeDevice(userId: string, deviceId: string) {
    return this.deviceService.revokeDevice(userId, deviceId);
  }
}
