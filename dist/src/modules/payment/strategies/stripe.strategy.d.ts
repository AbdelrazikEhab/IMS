import { ConfigService } from '@nestjs/config';
import { PaymentStrategy, PaymentMetadata, PaymentIntent, RefundResult } from './payment.strategy.interface';
export declare class StripeStrategy implements PaymentStrategy {
    private readonly config;
    name: "STRIPE";
    private stripe;
    constructor(config: ConfigService);
    initiate(amount: number, currency: string, metadata: PaymentMetadata): Promise<PaymentIntent>;
    verifyWebhook(payload: unknown, signature: string): boolean;
    refund(externalRef: string, amount: number): Promise<RefundResult>;
}
