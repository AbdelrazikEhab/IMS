var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
import { Injectable, NotFoundException, BadRequestException, Logger, } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymobStrategy } from './strategies/paymob.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentGateway } from '@prisma/client';
let PaymentService = PaymentService_1 = class PaymentService {
    prisma;
    redis;
    eventEmitter;
    paymob;
    stripe;
    logger = new Logger(PaymentService_1.name);
    strategies;
    constructor(prisma, redis, eventEmitter, paymob, stripe) {
        this.prisma = prisma;
        this.redis = redis;
        this.eventEmitter = eventEmitter;
        this.paymob = paymob;
        this.stripe = stripe;
        this.strategies = new Map([
            [PaymentGateway.PAYMOB, this.paymob],
            [PaymentGateway.STRIPE, this.stripe],
        ]);
    }
    getStrategy(gateway) {
        const strategy = this.strategies.get(gateway);
        if (!strategy) {
            throw new BadRequestException(`Payment gateway '${gateway}' not supported`);
        }
        return strategy;
    }
    async initiate(tenantId, studentId, courseId, bookId, gateway, idempotencyKey) {
        const existing = await this.prisma.payment.findFirst({
            where: { idempotency_key: idempotencyKey },
        });
        if (existing)
            return { paymentId: existing.id, status: existing.status };
        let amount = 0;
        let description = '';
        if (courseId) {
            const course = await this.prisma.course.findFirst({
                where: { id: courseId, tenant_id: tenantId },
            });
            if (!course)
                throw new NotFoundException('Course not found');
            amount = course.price_cents;
            description = `Enrollment: ${course.title}`;
        }
        const strategy = this.getStrategy(gateway);
        const intent = await strategy.initiate(amount, 'EGP', {
            tenantId,
            studentId,
            courseId,
            bookId,
            description,
        });
        const payment = await this.prisma.payment.create({
            data: {
                tenant_id: tenantId,
                student_id: studentId,
                amount_cents: amount,
                currency: 'EGP',
                gateway,
                idempotency_key: idempotencyKey,
                external_ref: intent.externalRef,
                course_id: courseId,
                gateway_payload: intent.gatewayPayload,
            },
        });
        return {
            paymentId: payment.id,
            checkoutUrl: intent.checkoutUrl,
            status: 'PENDING',
        };
    }
    async handleWebhook(gateway, payload, signature) {
        const strategy = this.getStrategy(gateway);
        const isValid = strategy.verifyWebhook(payload, signature);
        if (!isValid)
            throw new BadRequestException('Invalid webhook signature');
        const eventId = payload['id'];
        const cacheKey = `webhook:processed:${gateway}:${eventId}`;
        const processed = await this.redis.exists(cacheKey);
        if (processed) {
            this.logger.log(`Duplicate webhook ${gateway}:${eventId} — skipping`);
            return { received: true };
        }
        await this.redis.set(cacheKey, '1', 86400);
        const externalRef = payload['order']?.['id'] ??
            eventId;
        const payment = await this.prisma.payment.findFirst({
            where: { external_ref: externalRef },
        });
        if (payment) {
            await this.prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'ACTIVE',
                        activated_at: new Date(),
                        gateway_payload: payload,
                    },
                });
                if (payment.course_id) {
                    await tx.enrollment.upsert({
                        where: {
                            tenant_id_student_id_course_id: {
                                tenant_id: payment.tenant_id,
                                student_id: payment.student_id,
                                course_id: payment.course_id,
                            },
                        },
                        create: {
                            tenant_id: payment.tenant_id,
                            student_id: payment.student_id,
                            course_id: payment.course_id,
                            payment_id: payment.id,
                            status: 'ACTIVE',
                            enrolled_at: new Date(),
                            activated_at: new Date(),
                        },
                        update: {
                            status: 'ACTIVE',
                            activated_at: new Date(),
                        },
                    });
                }
            });
            this.eventEmitter.emit('payment.completed', { paymentId: payment.id });
        }
        return { received: true };
    }
    async getPaymentStatus(paymentId, studentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, student_id: studentId },
        });
        if (!payment)
            throw new NotFoundException('Payment not found');
        return payment;
    }
    async getHistory(tenantId, studentId) {
        return this.prisma.payment.findMany({
            where: { tenant_id: tenantId, student_id: studentId },
            orderBy: { created_at: 'desc' },
            take: 50,
        });
    }
    async forceRefund(paymentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId },
        });
        if (!payment)
            throw new NotFoundException('Payment not found');
        const strategy = this.getStrategy(payment.gateway);
        const result = await strategy.refund(payment.external_ref ?? '', payment.amount_cents);
        if (result.success) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'REFUNDED' },
            });
        }
        return result;
    }
};
PaymentService = PaymentService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        RedisService,
        EventEmitter2,
        PaymobStrategy,
        StripeStrategy])
], PaymentService);
export { PaymentService };
//# sourceMappingURL=payment.service.js.map