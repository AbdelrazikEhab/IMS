import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';

// Shared
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

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CourseModule } from './modules/course/course.module';
import { BookModule } from './modules/book/book.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuditModule } from './modules/audit/audit.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { AIModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 req/min global
      },
    ]),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      },
    }),
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
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // Auth first
    { provide: APP_GUARD, useClass: TenantGuard }, // Tenant second
    { provide: APP_GUARD, useClass: RolesGuard }, // Roles third
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, TenantMiddleware).forRoutes('*');
  }
}
