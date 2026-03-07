var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '@prisma/client';
import Stripe from 'stripe';
let StripeStrategy = class StripeStrategy {
    config;
    name = PaymentGateway.STRIPE;
    stripe;
    constructor(config) {
        this.config = config;
        this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY', ''));
    }
    async initiate(amount, currency, metadata) {
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
    verifyWebhook(payload, signature) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', '');
        try {
            this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return true;
        }
        catch {
            return false;
        }
    }
    async refund(externalRef, amount) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(externalRef);
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
};
StripeStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], StripeStrategy);
export { StripeStrategy };
//# sourceMappingURL=stripe.strategy.js.map