var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import { randomInt } from 'crypto';
const OTP_TTL = 600;
let OtpService = class OtpService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async sendOtp(userId, contact, type) {
        const otp = this.generateOtp();
        const key = `otp:${type}:${userId}`;
        await this.redis.setJson(key, { otp, contact, attempts: 0 }, OTP_TTL);
        console.log(`[OTP] ${type} for ${contact}: ${otp}`);
        return otp;
    }
    async validateOtp(userId, otp, type) {
        const key = `otp:${type}:${userId}`;
        const stored = await this.redis.getJson(key);
        if (!stored) {
            throw new BadRequestException('OTP expired or not found');
        }
        if (stored.attempts >= 3) {
            await this.redis.del(key);
            throw new BadRequestException('Too many attempts. Please request a new OTP');
        }
        if (stored.otp !== otp) {
            stored.attempts += 1;
            const ttl = await this.redis.getClient().ttl(key);
            await this.redis.setJson(key, stored, ttl > 0 ? ttl : OTP_TTL);
            throw new BadRequestException('Invalid OTP');
        }
        await this.redis.del(key);
    }
    generateOtp() {
        return randomInt(100000, 999999).toString();
    }
};
OtpService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [RedisService])
], OtpService);
export { OtpService };
//# sourceMappingURL=otp.service.js.map