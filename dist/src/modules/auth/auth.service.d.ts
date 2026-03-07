import { PrismaService } from '../../shared/prisma/prisma.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { DeviceService } from './device.service';
import { RegisterTeacherDto, RegisterStudentDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly tokenService;
    private readonly otpService;
    private readonly deviceService;
    constructor(prisma: PrismaService, tokenService: TokenService, otpService: OtpService, deviceService: DeviceService);
    registerTeacher(dto: RegisterTeacherDto): Promise<{
        message: string;
        tenant: {
            id: string;
            subdomain: string;
            name: string;
        };
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    registerStudent(dto: RegisterStudentDto, tenantId: string): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
    }>;
    login(dto: LoginDto, tenantId: string, ip: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
        };
        tenant: {
            name: string;
            subdomain: string;
            id: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto, tenantId: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto, tenantId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getMe(userId: string, tenantId: string): Promise<{
        tenant: {
            name: string;
            subdomain: string;
            id: string;
            status: import("@prisma/client").$Enums.TenantStatus;
            plan: import("@prisma/client").$Enums.PlanTier;
            logo_url: string | null;
            primary_color: string | null;
            landing_template: string | null;
        };
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        tenant_id: string;
        phone: string | null;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        is_active: boolean;
        is_verified: boolean;
        locale: string | null;
        max_devices: number;
        last_login_at: Date | null;
        last_login_ip: string | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }>;
    getDevices(userId: string): Promise<{
        name: string | null;
        id: string;
        created_at: Date;
        user_agent: string | null;
        last_ip: string | null;
        last_seen_at: Date;
        is_trusted: boolean;
    }[]>;
    revokeDevice(userId: string, deviceId: string): Promise<{
        message: string;
    }>;
}
