import { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { PaymentGateway } from '@prisma/client';
import { Request } from 'express';
declare class InitiatePaymentDto {
    courseId?: string;
    bookId?: string;
    gateway: PaymentGateway;
    idempotencyKey: string;
}
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    initiate(tenantId: string, user: AuthenticatedUser, dto: InitiatePaymentDto): Promise<{
        paymentId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        checkoutUrl?: undefined;
    } | {
        paymentId: string;
        checkoutUrl: string | undefined;
        status: string;
    }>;
    getStatus(user: AuthenticatedUser, id: string): Promise<{
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
    getHistory(tenantId: string, user: AuthenticatedUser): Promise<{
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
    paymobWebhook(payload: unknown, hmac: string): Promise<{
        received: boolean;
    }>;
    stripeWebhook(req: RawBodyRequest<Request>, sig: string): Promise<{
        received: boolean;
    }>;
    fawryWebhook(payload: unknown): Promise<{
        received: boolean;
    }>;
    tapWebhook(payload: unknown, sig: string): Promise<{
        received: boolean;
    }>;
}
export {};
