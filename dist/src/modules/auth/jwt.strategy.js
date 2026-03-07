var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
let JwtStrategy = class JwtStrategy extends PassportStrategy(Strategy) {
    prisma;
    constructor(config, prisma) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET', ''),
        });
        this.prisma = prisma;
    }
    async validate(payload) {
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
        if (!user)
            return null;
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
};
JwtStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        PrismaService])
], JwtStrategy);
export { JwtStrategy };
//# sourceMappingURL=jwt.strategy.js.map