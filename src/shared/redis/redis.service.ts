import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying
        return Math.min(times * 100, 3000);
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.error(`Redis GET error: ${err}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.error(`Redis SET error: ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Redis DEL error: ${err}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      this.logger.error(`Redis EXISTS error: ${err}`);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.incr(key);
    } catch (err) {
      this.logger.error(`Redis INCR error: ${err}`);
      return 0;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.expire(key, ttlSeconds);
    } catch (err) {
      this.logger.error(`Redis EXPIRE error: ${err}`);
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.hset(key, field, value);
    } catch (err) {
      this.logger.error(`Redis HSET error: ${err}`);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.hget(key, field);
    } catch (err) {
      this.logger.error(`Redis HGET error: ${err}`);
      return null;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.hdel(key, ...fields);
    } catch (err) {
      this.logger.error(`Redis HDEL error: ${err}`);
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.isConnected) return {};
    try {
      return await this.client.hgetall(key);
    } catch (err) {
      this.logger.error(`Redis HGETALL error: ${err}`);
      return {};
    }
  }
}
