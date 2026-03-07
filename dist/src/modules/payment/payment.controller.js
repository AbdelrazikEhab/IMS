var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Param, Req, HttpCode, HttpStatus, Headers, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { UserRole, PaymentGateway } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
class InitiatePaymentDto {
    courseId;
    bookId;
    gateway;
    idempotencyKey;
}
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "courseId", void 0);
__decorate([
    ApiPropertyOptional(),
    IsOptional(),
    IsUUID(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "bookId", void 0);
__decorate([
    ApiProperty({ enum: PaymentGateway }),
    IsEnum(PaymentGateway),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "gateway", void 0);
__decorate([
    ApiProperty(),
    IsString(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "idempotencyKey", void 0);
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    initiate(tenantId, user, dto) {
        return this.paymentService.initiate(tenantId, user.id, dto.courseId, dto.bookId, dto.gateway, dto.idempotencyKey);
    }
    getStatus(user, id) {
        return this.paymentService.getPaymentStatus(id, user.id);
    }
    getHistory(tenantId, user) {
        return this.paymentService.getHistory(tenantId, user.id);
    }
    paymobWebhook(payload, hmac) {
        return this.paymentService.handleWebhook(PaymentGateway.PAYMOB, payload, hmac);
    }
    stripeWebhook(req, sig) {
        return this.paymentService.handleWebhook(PaymentGateway.STRIPE, req.rawBody, sig);
    }
    fawryWebhook(payload) {
        return this.paymentService.handleWebhook(PaymentGateway.FAWRY, payload, '');
    }
    tapWebhook(payload, sig) {
        return this.paymentService.handleWebhook(PaymentGateway.TAP, payload, sig);
    }
};
__decorate([
    Post('payments/initiate'),
    ApiBearerAuth(),
    Roles(UserRole.STUDENT),
    ApiOperation({ summary: 'Initiate payment for course or book' }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, InitiatePaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "initiate", null);
__decorate([
    Get('payments/:id'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get payment status' }),
    __param(0, CurrentUser()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getStatus", null);
__decorate([
    Get('payments/history'),
    ApiBearerAuth(),
    ApiOperation({ summary: "Student's payment history" }),
    __param(0, TenantId()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "getHistory", null);
__decorate([
    Public(),
    Post('webhooks/paymob'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Paymob webhook callback' }),
    __param(0, Body()),
    __param(1, Headers('hmac')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "paymobWebhook", null);
__decorate([
    Public(),
    Post('webhooks/stripe'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Stripe webhook callback' }),
    __param(0, Req()),
    __param(1, Headers('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "stripeWebhook", null);
__decorate([
    Public(),
    Post('webhooks/fawry'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Fawry webhook callback' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "fawryWebhook", null);
__decorate([
    Public(),
    Post('webhooks/tap'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Tap webhook callback' }),
    __param(0, Body()),
    __param(1, Headers('hashstring')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PaymentController.prototype, "tapWebhook", null);
PaymentController = __decorate([
    ApiTags('Payments'),
    Controller({ version: '1' }),
    __metadata("design:paramtypes", [PaymentService])
], PaymentController);
export { PaymentController };
//# sourceMappingURL=payment.controller.js.map