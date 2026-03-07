import { Request } from 'express';
import { UserRole } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    tenantId: string;
    role: UserRole;
    deviceId: string;
    impersonatedBy?: string;
    iat: number;
    exp: number;
}
export interface AuthenticatedUser {
    id: string;
    tenantId: string;
    role: UserRole;
    deviceId: string;
    email: string;
    firstName: string;
    lastName: string;
    impersonatedBy?: string;
}
export interface AppRequest extends Request {
    user: AuthenticatedUser;
    tenantId: string;
    tenant: {
        id: string;
        subdomain: string;
        name: string;
        status: string;
        plan: string;
        features: Record<string, unknown>;
    };
    requestId: string;
}
