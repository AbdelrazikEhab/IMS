import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import { randomInt } from 'crypto';

type OtpType = 'password_reset' | 'phone_verify' | 'email_verify';
const OTP_TTL = 600; // 10 minutes

@Injectable()
export class OtpService {
  constructor(private readonly redis: RedisService) {}

  async sendOtp(
    userId: string,
    contact: string,
    type: OtpType,
  ): Promise<string> {
    const otp = this.generateOtp();
    const key = `otp:${type}:${userId}`;

    await this.redis.setJson(key, { otp, contact, attempts: 0 }, OTP_TTL);

    // In production: send via email/WhatsApp/SMS
    // For now, log (remove in production!)
    console.log(`[OTP] ${type} for ${contact}: ${otp}`);

    return otp;
  }

  async validateOtp(userId: string, otp: string, type: OtpType): Promise<void> {
    const key = `otp:${type}:${userId}`;
    const stored = await this.redis.getJson<{ otp: string; attempts: number }>(
      key,
    );

    if (!stored) {
      throw new BadRequestException('OTP expired or not found');
    }

    if (stored.attempts >= 3) {
      await this.redis.del(key);
      throw new BadRequestException(
        'Too many attempts. Please request a new OTP',
      );
    }

    if (stored.otp !== otp) {
      // Increment attempts
      stored.attempts += 1;
      const ttl = await this.redis.getClient().ttl(key);
      await this.redis.setJson(key, stored, ttl > 0 ? ttl : OTP_TTL);
      throw new BadRequestException('Invalid OTP');
    }

    // Valid — delete OTP
    await this.redis.del(key);
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }
}
