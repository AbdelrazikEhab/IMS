import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../../shared/types/request.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', ''),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Minimal validation — token validity is checked by JWT strategy
    // For performance, we trust the JWT; full user lookup only when needed
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, is_active: true },
      select: {
        id: true,
        tenant_id: true,
        role: true,
        email: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!user) return null as unknown as AuthenticatedUser;

    return {
      id: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      deviceId: payload.deviceId,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      impersonatedBy: payload.impersonatedBy,
    };
  }
}
