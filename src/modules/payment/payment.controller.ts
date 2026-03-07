import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { AuthenticatedUser } from '../../shared/types/request.type';
import { UserRole, PaymentGateway } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Request } from 'express';

class InitiatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bookId?: string;

  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty()
  @IsString()
  idempotencyKey: string;
}

@ApiTags('Payments')
@Controller({ version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payments/initiate')
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Initiate payment for course or book' })
  initiate(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentService.initiate(
      tenantId,
      user.id,
      dto.courseId,
      dto.bookId,
      dto.gateway,
      dto.idempotencyKey,
    );
  }

  @Get('payments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status' })
  getStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id, user.id);
  }

  @Get('payments/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Student's payment history" })
  getHistory(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paymentService.getHistory(tenantId, user.id);
  }

  // ── WEBHOOKS (public, signature-verified) ──

  @Public()
  @Post('webhooks/paymob')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paymob webhook callback' })
  paymobWebhook(@Body() payload: unknown, @Headers('hmac') hmac: string) {
    return this.paymentService.handleWebhook(
      PaymentGateway.PAYMOB,
      payload,
      hmac,
    );
  }

  @Public()
  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook callback' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentService.handleWebhook(
      PaymentGateway.STRIPE,
      req.rawBody,
      sig,
    );
  }

  @Public()
  @Post('webhooks/fawry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fawry webhook callback' })
  fawryWebhook(@Body() payload: unknown) {
    return this.paymentService.handleWebhook(PaymentGateway.FAWRY, payload, '');
  }

  @Public()
  @Post('webhooks/tap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tap webhook callback' })
  tapWebhook(@Body() payload: unknown, @Headers('hashstring') sig: string) {
    return this.paymentService.handleWebhook(PaymentGateway.TAP, payload, sig);
  }
}
