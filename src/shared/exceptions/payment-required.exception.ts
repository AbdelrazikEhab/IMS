// NestJS doesn't have PaymentRequiredException; map to 402
import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(message = 'Payment required to access this content') {
    super(
      {
        error: 'PAYMENT_REQUIRED',
        message,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
