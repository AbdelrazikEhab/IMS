import { AuthService } from './auth.service';
import { AuthenticatedUser, AppRequest } from '../../shared/types/request.type';
import { RegisterTeacherDto, RegisterStudentDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(dto: LoginDto, tenantId: string, req: AppRequest): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: AuthenticatedUser, dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    getDevices(user: AuthenticatedUser): Promise<{
        name: string | null;
        id: string;
        created_at: Date;
        user_agent: string | null;
        last_ip: string | null;
        last_seen_at: Date;
        is_trusted: boolean;
    }[]>;
    revokeDevice(user: AuthenticatedUser, deviceId: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto, tenantId: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto, tenantId: string): Promise<{
        message: string;
    }>;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getMe(user: AuthenticatedUser, tenantId: string): Promise<{
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
}
