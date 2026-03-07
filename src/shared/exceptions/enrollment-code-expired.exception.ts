import { HttpException, HttpStatus } from '@nestjs/common';

export class EnrollmentCodeExpiredException extends HttpException {
  constructor(
    message = 'This enrollment code has expired or reached its usage limit',
  ) {
    super(
      {
        error: 'ENROLLMENT_CODE_EXPIRED',
        message,
      },
      HttpStatus.GONE,
    );
  }
}
