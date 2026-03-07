import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async registerOrUpdateDevice(
    userId: string,
    maxDevices: number,
    fingerprint?: string,
    deviceName?: string,
    userAgent?: string,
    ip?: string,
  ) {
    const fp = fingerprint || uuidv4();

    // Try to find existing device
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

    // Check device limit
    const deviceCount = await this.prisma.device.count({
      where: { user_id: userId },
    });

    if (deviceCount >= maxDevices) {
      throw new ForbiddenException(
        `Device limit reached (max ${maxDevices} devices). Please remove an existing device.`,
      );
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

  async getUserDevices(userId: string) {
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

  async revokeDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, user_id: userId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Revoke all refresh tokens for this device
    await this.prisma.refreshToken.updateMany({
      where: { device_id: deviceId, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    await this.prisma.device.delete({ where: { id: deviceId } });

    return { message: 'Device revoked successfully' };
  }
}
