import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class DeviceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerOrUpdateDevice(userId: string, maxDevices: number, fingerprint?: string, deviceName?: string, userAgent?: string, ip?: string): Promise<{
        name: string | null;
        id: string;
        created_at: Date;
        user_id: string;
        fingerprint: string;
        user_agent: string | null;
        last_ip: string | null;
        last_seen_at: Date;
        is_trusted: boolean;
    }>;
    getUserDevices(userId: string): Promise<{
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
