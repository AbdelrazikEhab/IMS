var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
import { Catch, HttpException, HttpStatus, Logger, } from '@nestjs/common';
import { Prisma } from '@prisma/client';
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details = [];
        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                error = this.statusToError(statusCode);
            }
            else if (typeof res === 'object' && res !== null) {
                const resObj = res;
                message = resObj.message || message;
                error = resObj.error || this.statusToError(statusCode);
                details = Array.isArray(resObj.message)
                    ? resObj.message
                    : [];
                if (typeof resObj.message === 'string')
                    message = resObj.message;
            }
        }
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
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
        }
        else if (exception instanceof Prisma.PrismaClientValidationError) {
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
            this.logger.error(`[${statusCode}] ${error}: ${message}`, exception instanceof Error ? exception.stack : String(exception), {
                path: request?.url,
                requestId: request?.requestId,
                tenantId: request?.tenantId,
                userId: request?.user?.id,
            });
        }
        else {
            this.logger.warn(`[${statusCode}] ${error}: ${message}`, {
                path: request?.url,
                requestId: request?.requestId,
            });
        }
        response.status(statusCode).json(errorResponse);
    }
    statusToError(status) {
        const map = {
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
};
AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    Catch()
], AllExceptionsFilter);
export { AllExceptionsFilter };
//# sourceMappingURL=all-exceptions.filter.js.map