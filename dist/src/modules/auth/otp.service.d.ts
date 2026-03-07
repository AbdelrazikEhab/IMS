import { RedisService } from '../../shared/redis/redis.service';
type OtpType = 'password_reset' | 'phone_verify' | 'email_verify';
export declare class OtpService {
    private readonly redis;
    constructor(redis: RedisService);
    sendOtp(userId: string, contact: string, type: OtpType): Promise<string>;
    validateOtp(userId: string, otp: string, type: OtpType): Promise<void>;
    private generateOtp;
}
export {};
