export declare class RegisterTeacherDto {
    subdomain: string;
    platformName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    countryCode?: string;
}
export declare class RegisterStudentDto {
    enrollmentCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    deviceFingerprint?: string;
    deviceName?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    email: string;
    otp: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
