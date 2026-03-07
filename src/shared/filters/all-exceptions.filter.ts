import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppRequest } from '../types/request.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AppRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = this.statusToError(statusCode);
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string) || message;
        error = (resObj.error as string) || this.statusToError(statusCode);
        details = Array.isArray(resObj.message)
          ? (resObj.message as unknown[])
          : [];
        if (typeof resObj.message === 'string') message = resObj.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Map Prisma errors to HTTP errors — never expose raw Prisma errors
      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.CONFLICT;
          error = 'CONFLICT';
          message = `A record with this value already exists`;
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          error = 'NOT_FOUND';
          message = 'Record not found';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          error = 'FOREIGN_KEY_VIOLATION';
          message = 'Related record not found';
          break;
        default:
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          error = 'DATABASE_ERROR';
          message = 'A database error occurred';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'VALIDATION_FAILED';
      message = 'Invalid data provided';
    }

    const errorResponse = {
      success: false,
      statusCode,
      error,
      message,
      details,
      requestId: request?.requestId ?? 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `[${statusCode}] ${error}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
        {
          path: request?.url,
          requestId: request?.requestId,
          tenantId: request?.tenantId,
          userId: request?.user?.id,
        },
      );
    } else {
      this.logger.warn(`[${statusCode}] ${error}: ${message}`, {
        path: request?.url,
        requestId: request?.requestId,
      });
    }

    response.status(statusCode).json(errorResponse);
  }

  private statusToError(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_FAILED',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] ?? 'ERROR';
  }
}
