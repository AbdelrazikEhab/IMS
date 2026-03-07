import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStrategy,
  PaymentMetadata,
  PaymentIntent,
  RefundResult,
} from './payment.strategy.interface';
import { PaymentGateway } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  name = PaymentGateway.STRIPE;
  private stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY', ''));
  }

  async initiate(
    amount: number,
    currency: string,
    metadata: PaymentMetadata,
  ): Promise<PaymentIntent> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: metadata.description },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        tenantId: metadata.tenantId,
        studentId: metadata.studentId,
        courseId: metadata.courseId ?? '',
        bookId: metadata.bookId ?? '',
      },
      success_url: `${this.config.get('APP_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('APP_URL')}/payment/cancel`,
    });

    return {
      externalRef: session.id,
      checkoutUrl: session.url ?? undefined,
      gatewayPayload: { sessionId: session.id },
    };
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    try {
      this.stripe.webhooks.constructEvent(
        payload as string | Buffer,
        signature,
        webhookSecret,
      );
      return true;
    } catch {
      return false;
    }
  }

  async refund(externalRef: string, amount: number): Promise<RefundResult> {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(externalRef);
    const refund = await this.stripe.refunds.create({
      payment_intent: externalRef,
      amount,
    });
    return {
      success: refund.status === 'succeeded',
      refundId: refund.id,
      message: `Refund ${refund.status}`,
    };
  }
}
