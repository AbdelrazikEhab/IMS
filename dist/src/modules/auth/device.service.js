var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ForbiddenException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
let DeviceService = class DeviceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerOrUpdateDevice(userId, maxDevices, fingerprint, deviceName, userAgent, ip) {
        const fp = fingerprint || uuidv4();
        const existing = await this.prisma.device.findFirst({
            where: { user_id: userId, fingerprint: fp },
        });
        if (existing) {
            return this.prisma.device.update({
                where: { id: existing.id },
                data: {
                    last_seen_at: new Date(),
                    last_ip: ip,
                    user_agent: userAgent,
                },
            });
        }
        const deviceCount = await this.prisma.device.count({
            where: { user_id: userId },
        });
        if (deviceCount >= maxDevices) {
            throw new ForbiddenException(`Device limit reached (max ${maxDevices} devices). Please remove an existing device.`);
        }
        return this.prisma.device.create({
            data: {
                user_id: userId,
                fingerprint: fp,
                name: deviceName,
                user_agent: userAgent,
                last_ip: ip,
                last_seen_at: new Date(),
            },
        });
    }
    async getUserDevices(userId) {
        return this.prisma.device.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                name: true,
                user_agent: true,
                last_ip: true,
                last_seen_at: true,
                is_trusted: true,
                created_at: true,
            },
            orderBy: { last_seen_at: 'desc' },
        });
    }
    async revokeDevice(userId, deviceId) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, user_id: userId },
        });
        if (!device) {
            throw new NotFoundException('Device not found');
        }
        await this.prisma.refreshToken.updateMany({
            where: { device_id: deviceId, revoked_at: null },
            data: { revoked_at: new Date() },
        });
        await this.prisma.device.delete({ where: { id: deviceId } });
        return { message: 'Device revoked successfully' };
    }
};
DeviceService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], DeviceService);
export { DeviceService };
//# sourceMappingURL=device.service.js.map