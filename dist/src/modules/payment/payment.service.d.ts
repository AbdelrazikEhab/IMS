import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymobStrategy } from './strategies/paymob.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentGateway } from '@prisma/client';
export declare class PaymentService {
    private readonly prisma;
    private readonly redis;
    private readonly eventEmitter;
    private readonly paymob;
    private readonly stripe;
    private readonly logger;
    private readonly strategies;
    constructor(prisma: PrismaService, redis: RedisService, eventEmitter: EventEmitter2, paymob: PaymobStrategy, stripe: StripeStrategy);
    private getStrategy;
    initiate(tenantId: string, studentId: string, courseId: string | undefined, bookId: string | undefined, gateway: PaymentGateway, idempotencyKey: string): Promise<{
        paymentId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        checkoutUrl?: undefined;
    } | {
        paymentId: string;
        checkoutUrl: string | undefined;
        status: string;
    }>;
    handleWebhook(gateway: PaymentGateway, payload: unknown, signature: string): Promise<{
        received: boolean;
    }>;
    getPaymentStatus(paymentId: string, studentId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        amount_cents: number;
        currency: string;
        course_id: string | null;
        student_id: string;
        activated_at: Date | null;
        gateway: import("@prisma/client").$Enums.PaymentGateway;
        idempotency_key: string;
        external_ref: string | null;
        gateway_payload: import("@prisma/client/runtime/client").JsonValue | null;
        activated_by: string | null;
    }>;
    getHistory(tenantId: string, studentId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        tenant_id: string;
        created_at: Date;
        updated_at: Date;
        amount_cents: number;
        currency: string;
        course_id: string | null;
        student_id: string;
        activated_at: Date | null;
        gateway: import("@prisma/client").$Enums.PaymentGateway;
        idempotency_key: string;
        external_ref: string | null;
        gateway_payload: import("@prisma/client/runtime/client").JsonValue | null;
        activated_by: string | null;
    }[]>;
    forceRefund(paymentId: string): Promise<import("./strategies/payment.strategy.interface").RefundResult>;
}
