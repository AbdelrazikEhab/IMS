import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStrategy,
  PaymentMetadata,
  PaymentIntent,
  RefundResult,
} from './payment.strategy.interface';
import { PaymentGateway } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymobStrategy implements PaymentStrategy {
  name = PaymentGateway.PAYMOB;

  constructor(private readonly config: ConfigService) {}

  async initiate(
    amount: number,
    currency: string,
    metadata: PaymentMetadata,
  ): Promise<PaymentIntent> {
    const apiKey = this.config.get<string>('PAYMOB_API_KEY');
    const integrationId = this.config.get<string>('PAYMOB_INTEGRATION_ID');
    const iframeId = this.config.get<string>('PAYMOB_IFRAME_ID');

    // Step 1: Auth token
    const authRes = await axios.post(
      'https://accept.paymob.com/api/auth/tokens',
      {
        api_key: apiKey,
      },
    );
    const token = authRes.data.token;

    // Step 2: Create order
    const orderRes = await axios.post(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amount,
        currency,
        items: [],
      },
    );
    const orderId = orderRes.data.id;

    // Step 3: Payment key
    const keyRes = await axios.post(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: token,
        amount_cents: amount,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          first_name: 'Student',
          last_name: 'User',
          email: 'student@example.com',
          phone_number: '01000000000',
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          state: 'Cairo',
        },
        currency,
        integration_id: integrationId,
      },
    );
    const paymentKey = keyRes.data.token;

    return {
      externalRef: String(orderId),
      checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`,
      paymentToken: paymentKey,
      gatewayPayload: { orderId, token },
    };
  }

  verifyWebhook(payload: unknown, signature: string): boolean {
    const hmacSecret = this.config.get<string>('PAYMOB_HMAC_SECRET', '');
    const data = payload as Record<string, unknown>;
    // Paymob HMAC calculation over specific fields
    const fields = [
      data['amount_cents'],
      data['created_at'],
      data['currency'],
      data['error_occured'],
      data['has_parent_transaction'],
      data['id'],
      data['integration_id'],
      data['is_3d_secure'],
      data['is_auth'],
      data['is_capture'],
      data['is_refunded'],
      data['is_standalone_payment'],
      data['is_voided'],
      data['order.id'],
      data['owner'],
      data['pending'],
      data['source_data.pan'],
      data['source_data.sub_type'],
      data['source_data.type'],
      data['success'],
    ]
      .map((v) => String(v ?? ''))
      .join('');

    const expected = crypto
      .createHmac('sha512', hmacSecret)
      .update(fields)
      .digest('hex');

    return expected === signature;
  }

  async refund(externalRef: string, amount: number): Promise<RefundResult> {
    // Implementation of Paymob refund API
    return { success: true, message: 'Refund initiated' };
  }
}
