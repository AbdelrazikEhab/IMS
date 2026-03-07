var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { QueueModule } from './shared/queue/queue.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { TenantGuard } from './shared/guards/tenant.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { TenantMiddleware } from './shared/middleware/tenant.middleware';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CourseModule } from './modules/course/course.module';
import { BookModule } from './modules/book/book.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuditModule } from './modules/audit/audit.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { AIModule } from './modules/ai/ai.module';
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(CorrelationIdMiddleware, TenantMiddleware).forRoutes('*');
    }
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            EventEmitterModule.forRoot(),
            PrismaModule,
            RedisModule,
            QueueModule,
            AuthModule,
            TenantModule,
            CourseModule,
            BookModule,
            PaymentModule,
            AuditModule,
            SuperAdminModule,
            AIModule,
        ],
        providers: [
            { provide: APP_GUARD, useClass: JwtAuthGuard },
            { provide: APP_GUARD, useClass: TenantGuard },
            { provide: APP_GUARD, useClass: RolesGuard },
            { provide: APP_FILTER, useClass: AllExceptionsFilter },
            { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
            { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
            { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map