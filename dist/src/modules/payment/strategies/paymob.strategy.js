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
import axios from 'axios';
import * as crypto from 'crypto';
let PaymobStrategy = class PaymobStrategy {
    config;
    name = PaymentGateway.PAYMOB;
    constructor(config) {
        this.config = config;
    }
    async initiate(amount, currency, metadata) {
        const apiKey = this.config.get('PAYMOB_API_KEY');
        const integrationId = this.config.get('PAYMOB_INTEGRATION_ID');
        const iframeId = this.config.get('PAYMOB_IFRAME_ID');
        const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: apiKey,
        });
        const token = authRes.data.token;
        const orderRes = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: false,
            amount_cents: amount,
            currency,
            items: [],
        });
        const orderId = orderRes.data.id;
        const keyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
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
        });
        const paymentKey = keyRes.data.token;
        return {
            externalRef: String(orderId),
            checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`,
            paymentToken: paymentKey,
            gatewayPayload: { orderId, token },
        };
    }
    verifyWebhook(payload, signature) {
        const hmacSecret = this.config.get('PAYMOB_HMAC_SECRET', '');
        const data = payload;
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
    async refund(externalRef, amount) {
        return { success: true, message: 'Refund initiated' };
    }
};
PaymobStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], PaymobStrategy);
export { PaymobStrategy };
//# sourceMappingURL=paymob.strategy.js.map