import { HttpException } from '@nestjs/common';
export declare class EnrollmentCodeExpiredException extends HttpException {
    constructor(message?: string);
}
