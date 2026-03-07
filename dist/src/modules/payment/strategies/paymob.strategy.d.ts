import { ConfigService } from '@nestjs/config';
import { PaymentStrategy, PaymentMetadata, PaymentIntent, RefundResult } from './payment.strategy.interface';
export declare class PaymobStrategy implements PaymentStrategy {
    private readonly config;
    name: "PAYMOB";
    constructor(config: ConfigService);
    initiate(amount: number, currency: string, metadata: PaymentMetadata): Promise<PaymentIntent>;
    verifyWebhook(payload: unknown, signature: string): boolean;
    refund(externalRef: string, amount: number): Promise<RefundResult>;
}
