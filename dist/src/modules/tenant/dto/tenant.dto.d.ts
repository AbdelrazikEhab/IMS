export declare class UpdateBrandingDto {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    landingTemplate?: string;
}
export declare class UpdateTenantSettingsDto {
    timezone?: string;
    locale?: string;
}
export declare class CreateEnrollmentCodeDto {
    maxUses?: number;
    expiresAt?: string;
}
