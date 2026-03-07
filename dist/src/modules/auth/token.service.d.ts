import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { JwtPayload } from '../../shared/types/request.type';
import { User } from '@prisma/client';
export declare class TokenService {
    private readonly jwt;
    private readonly config;
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService, redis: RedisService);
    generateTokenPair(user: User & {
        tenant?: {
            id: string;
        };
    }, deviceId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    rotateRefreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    revokeRefreshToken(userId: string, refreshToken: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    validateAccessToken(token: string): Promise<JwtPayload>;
    generateImpersonationToken(targetUser: User, superAdminId: string): Promise<string>;
}
