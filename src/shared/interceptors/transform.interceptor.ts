import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppRequest } from '../types/request.type';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<AppRequest>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: request.requestId ?? 'unknown',
          timestamp: new Date().toISOString(),
          version: '1',
        },
      })),
    );
  }
}
