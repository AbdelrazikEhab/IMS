import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
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

  async generateTokenPair(user: any, deviceId: string) {
    const payload = {
      sub: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      deviceId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
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

    // Cache in Redis for quick revocation checks
    await this.redis.set(
      `refresh:${user.id}:${tokenHash.substring(0, 20)}`,
      user.id,
      7 * 24 * 3600, // 7 days
    );

    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(refreshToken: string) {
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

    return this.generateTokenPair(
      matchedToken.user,
      matchedToken.device_id ?? matchedToken.user.id,
    );
  }

  async revokeRefreshToken(userId: string, refreshToken: string) {
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

  async revokeAllUserTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async validateAccessToken(token: string) {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  async generateImpersonationToken(targetUser: any, superAdminId: string) {
    return this.jwt.signAsync(
      {
        sub: targetUser.id,
        tenantId: targetUser.tenant_id,
        role: targetUser.role,
        deviceId: 'impersonation',
        impersonatedBy: superAdminId,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '30m',
      },
    );
  }
}
