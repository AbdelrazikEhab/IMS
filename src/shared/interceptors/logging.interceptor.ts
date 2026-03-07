import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppRequest } from '../types/request.type';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AppRequest>();
    const { method, url, requestId, tenantId } = request;
    const userId = request.user?.id;
    const start = Date.now();

    return next.handle().pipe(
      tap({
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
        error: (err: Error) => {
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
      }),
    );
  }
}
