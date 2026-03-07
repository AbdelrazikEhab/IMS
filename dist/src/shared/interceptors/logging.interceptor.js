var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Logger, } from '@nestjs/common';
import { tap } from 'rxjs/operators';
let LoggingInterceptor = class LoggingInterceptor {
    logger = new Logger('HTTP');
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, requestId, tenantId } = request;
        const userId = request.user?.id;
        const start = Date.now();
        return next.handle().pipe(tap({
            next: () => {
                const duration = Date.now() - start;
                this.logger.log({
                    method,
                    url,
                    requestId,
                    tenantId,
                    userId,
                    duration_ms: duration,
                });
            },
            error: (err) => {
                const duration = Date.now() - start;
                this.logger.error({
                    method,
                    url,
                    requestId,
                    tenantId,
                    userId,
                    duration_ms: duration,
                    error: err.message,
                });
            },
        }));
    }
};
LoggingInterceptor = __decorate([
    Injectable()
], LoggingInterceptor);
export { LoggingInterceptor };
//# sourceMappingURL=logging.interceptor.js.map