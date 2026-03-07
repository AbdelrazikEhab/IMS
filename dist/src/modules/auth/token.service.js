var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenService_1;
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
let TokenService = TokenService_1 = class TokenService {
    jwt;
    config;
    prisma;
    redis;
    logger = new Logger(TokenService_1.name);
    constructor(jwt, config, prisma, redis) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
        this.redis = redis;
    }
    async generateTokenPair(user, deviceId) {
        const payload = {
            sub: user.id,
            tenantId: user.tenant_id,
            role: user.role,
            deviceId,
            iat: Math.floor(Date.now() / 1000),
            exp: 0,
        };
        const accessToken = await this.jwt.signAsync({ sub: user.id, tenantId: user.tenant_id, role: user.role, deviceId }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        });
        const refreshToken = uuidv4() + uuidv4();
        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token_hash: tokenHash,
                device_id: deviceId,
                expires_at: expiresAt,
            },
        });
        await this.redis.set(`refresh:${user.id}:${tokenHash.substring(0, 20)}`, user.id, 7 * 24 * 3600);
        return { accessToken, refreshToken };
    }
    async rotateRefreshToken(refreshToken) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: {
                revoked_at: null,
                expires_at: { gt: new Date() },
            },
            include: { user: true, device: true },
            take: 1000,
        });
        let matchedToken = null;
        for (const token of tokens) {
            const matches = await bcrypt.compare(refreshToken, token.token_hash);
            if (matches) {
                matchedToken = token;
                break;
            }
        }
        if (!matchedToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.update({
            where: { id: matchedToken.id },
            data: { revoked_at: new Date() },
        });
        return this.generateTokenPair(matchedToken.user, matchedToken.device_id ?? matchedToken.user_id);
    }
    async revokeRefreshToken(userId, refreshToken) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { user_id: userId, revoked_at: null },
        });
        for (const token of tokens) {
            const matches = await bcrypt.compare(refreshToken, token.token_hash);
            if (matches) {
                await this.prisma.refreshToken.update({
                    where: { id: token.id },
                    data: { revoked_at: new Date() },
                });
                break;
            }
        }
    }
    async revokeAllUserTokens(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { user_id: userId, revoked_at: null },
            data: { revoked_at: new Date() },
        });
    }
    async validateAccessToken(token) {
        try {
            return await this.jwt.verifyAsync(token, {
                secret: this.config.get('JWT_SECRET'),
            });
        }
        catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }
    generateImpersonationToken(targetUser, superAdminId) {
        return this.jwt.signAsync({
            sub: targetUser.id,
            tenantId: targetUser.tenant_id,
            role: targetUser.role,
            deviceId: 'impersonation',
            impersonatedBy: superAdminId,
        }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '30m',
        });
    }
};
TokenService = TokenService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [JwtService,
        ConfigService,
        PrismaService,
        RedisService])
], TokenService);
export { TokenService };
//# sourceMappingURL=token.service.js.map