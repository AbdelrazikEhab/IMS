import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymobStrategy } from './strategies/paymob.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentStrategy } from './strategies/payment.strategy.interface';
import { PaymentGateway } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly strategies: Map<PaymentGateway, PaymentStrategy>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymob: PaymobStrategy,
    private readonly stripe: StripeStrategy,
  ) {
    this.strategies = new Map<PaymentGateway, PaymentStrategy>([
      [PaymentGateway.PAYMOB, this.paymob],
      [PaymentGateway.STRIPE, this.stripe],
    ]);
  }

  private getStrategy(gateway: PaymentGateway): PaymentStrategy {
    const strategy = this.strategies.get(gateway);
    if (!strategy) {
      throw new BadRequestException(
        `Payment gateway '${gateway}' not supported`,
      );
    }
    return strategy;
  }

  async initiate(
    tenantId: string,
    studentId: string,
    courseId: string | undefined,
    bookId: string | undefined,
    gateway: PaymentGateway,
    idempotencyKey: string,
  ) {
    // Idempotency: check if already processed

    const existing = await this.prisma.payment.findFirst({
      where: { idempotency_key: idempotencyKey },
    });

    if (existing) return { paymentId: existing.id, status: existing.status };

    let amount = 0;
    let description = '';
    if (courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: courseId, tenant_id: tenantId },
      });
      if (!course) throw new NotFoundException('Course not found');

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
        gateway_payload: intent.gatewayPayload as any,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: intent.checkoutUrl,
      status: 'PENDING',
    };
  }

  async handleWebhook(
    gateway: PaymentGateway,
    payload: unknown,
    signature: string,
  ) {
    const strategy = this.getStrategy(gateway);
    const isValid = strategy.verifyWebhook(payload, signature);
    if (!isValid) throw new BadRequestException('Invalid webhook signature');

    // Parse payload for event ID (gateway-specific)
    const eventId = (payload as Record<string, unknown>)['id'] as string;
    const cacheKey = `webhook:processed:${gateway}:${eventId}`;

    // Idempotency: check if already processed
    const processed = await this.redis.exists(cacheKey);
    if (processed) {
      this.logger.log(`Duplicate webhook ${gateway}:${eventId} — skipping`);
      return { received: true };
    }

    // Mark as processed (24h TTL)
    await this.redis.set(cacheKey, '1', 86400);

    // Find payment by external_ref
    const externalRef =
      ((payload as Record<string, unknown>)['order']?.['id'] as string) ??
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
            gateway_payload: payload as any,
          },
        });

        // If course payment — create/activate enrollment

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

  async getPaymentStatus(paymentId: string, studentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, student_id: studentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getHistory(tenantId: string, studentId: string) {
    return this.prisma.payment.findMany({
      where: { tenant_id: tenantId, student_id: studentId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async forceRefund(paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const strategy = this.getStrategy(payment.gateway);

    const result = await strategy.refund(
      payment.external_ref ?? '',

      payment.amount_cents,
    );

    if (result.success) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });
    }

    return result;
  }
}
