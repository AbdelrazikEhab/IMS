import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private client;
    private readonly logger;
    private isConnected;
    constructor(config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    get connected(): boolean;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    incr(key: string): Promise<number>;
    expire(key: string, ttlSeconds: number): Promise<void>;
    getJson<T>(key: string): Promise<T | null>;
    setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    hset(key: string, field: string, value: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    hdel(key: string, ...fields: string[]): Promise<void>;
    hgetall(key: string): Promise<Record<string, string>>;
}
