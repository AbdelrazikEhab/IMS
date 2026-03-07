var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
import { Injectable, Logger, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
let RedisService = RedisService_1 = class RedisService {
    config;
    client;
    logger = new Logger(RedisService_1.name);
    isConnected = false;
    constructor(config) {
        this.config = config;
    }
    onModuleInit() {
        const redisUrl = this.config.get('REDIS_URL', 'redis://localhost:6379');
        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: false,
            retryStrategy: (times) => {
                if (times > 5)
                    return null;
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
    getClient() {
        return this.client;
    }
    get connected() {
        return this.isConnected;
    }
    async get(key) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (err) {
            this.logger.error(`Redis GET error: ${err}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.isConnected)
            return;
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (err) {
            this.logger.error(`Redis SET error: ${err}`);
        }
    }
    async del(key) {
        if (!this.isConnected)
            return;
        try {
            await this.client.del(key);
        }
        catch (err) {
            this.logger.error(`Redis DEL error: ${err}`);
        }
    }
    async exists(key) {
        if (!this.isConnected)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (err) {
            this.logger.error(`Redis EXISTS error: ${err}`);
            return false;
        }
    }
    async incr(key) {
        if (!this.isConnected)
            return 0;
        try {
            return await this.client.incr(key);
        }
        catch (err) {
            this.logger.error(`Redis INCR error: ${err}`);
            return 0;
        }
    }
    async expire(key, ttlSeconds) {
        if (!this.isConnected)
            return;
        try {
            await this.client.expire(key, ttlSeconds);
        }
        catch (err) {
            this.logger.error(`Redis EXPIRE error: ${err}`);
        }
    }
    async getJson(key) {
        const raw = await this.get(key);
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async setJson(key, value, ttlSeconds) {
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }
    async hset(key, field, value) {
        if (!this.isConnected)
            return;
        try {
            await this.client.hset(key, field, value);
        }
        catch (err) {
            this.logger.error(`Redis HSET error: ${err}`);
        }
    }
    async hget(key, field) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.hget(key, field);
        }
        catch (err) {
            this.logger.error(`Redis HGET error: ${err}`);
            return null;
        }
    }
    async hdel(key, ...fields) {
        if (!this.isConnected)
            return;
        try {
            await this.client.hdel(key, ...fields);
        }
        catch (err) {
            this.logger.error(`Redis HDEL error: ${err}`);
        }
    }
    async hgetall(key) {
        if (!this.isConnected)
            return {};
        try {
            return await this.client.hgetall(key);
        }
        catch (err) {
            this.logger.error(`Redis HGETALL error: ${err}`);
            return {};
        }
    }
};
RedisService = RedisService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], RedisService);
export { RedisService };
//# sourceMappingURL=redis.service.js.map