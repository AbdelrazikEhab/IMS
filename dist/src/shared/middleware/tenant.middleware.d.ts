import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
