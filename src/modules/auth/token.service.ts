import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { JwtPayload } from '../../shared/types/request.type';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async generateTokenPair(
    user: User & { tenant?: { id: string } },
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      deviceId,
      iat: Math.floor(Date.now() / 1000),
      exp: 0, // Will be set by JWT sign
    };

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, tenantId: user.tenant_id, role: user.role, deviceId },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as any,
      },
    );

    const refreshToken = uuidv4() + uuidv4(); // 72-char random token
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        device_id: deviceId,
        expires_at: expiresAt,
      },
    });

    // Store in Redis for fast revocation checking
    await this.redis.set(
      `refresh:${user.id}:${tokenHash.substring(0, 20)}`,
      user.id,
      7 * 24 * 3600,
    );

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find matching token in DB by checking all non-revoked tokens for matching hash
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
      include: { user: true, device: true },
      take: 1000, // Safety limit
    });

    let matchedToken: any = null;
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

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked_at: new Date() },
    });

    return this.generateTokenPair(
      matchedToken.user,
      matchedToken.device_id ?? matchedToken.user_id,
    );
  }

  async revokeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
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

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async validateAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  generateImpersonationToken(
    targetUser: User,
    superAdminId: string,
  ): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: targetUser.id,
        tenantId: targetUser.tenant_id,
        role: targetUser.role,
        deviceId: 'impersonation',
        impersonatedBy: superAdminId,
      },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '30m' as any,
      },
    );
  }
}
