import { PaymentGateway } from '@prisma/client';

export interface PaymentMetadata {
  orderId?: string;
  courseId?: string;
  bookId?: string;
  studentId: string;
  tenantId: string;
  description: string;
}

export interface PaymentIntent {
  externalRef: string;
  checkoutUrl?: string;
  paymentToken?: string;
  gatewayPayload: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message: string;
}

export interface PaymentStrategy {
  name: PaymentGateway;
  initiate(
    amount: number,
    currency: string,
    metadata: PaymentMetadata,
  ): Promise<PaymentIntent>;
  verifyWebhook(payload: unknown, signature: string): boolean;
  refund(externalRef: string, amount: number): Promise<RefundResult>;
}
