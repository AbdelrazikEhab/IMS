import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymobStrategy } from './strategies/paymob.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymobStrategy, StripeStrategy],
  exports: [PaymentService],
})
export class PaymentModule {}
