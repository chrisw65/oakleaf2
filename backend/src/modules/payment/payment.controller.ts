import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService, CreatePaymentIntentDto, CreateSubscriptionDto } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTenant } from '../auth/get-tenant.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create payment intent
   */
  @Post('intents')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('order:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createIntent(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    const result = await this.stripeService.createPaymentIntent(tenantId, userId, dto);

    return {
      success: true,
      data: {
        payment: result.payment,
        clientSecret: result.clientSecret,
      },
      message: 'Payment intent created',
    };
  }

  /**
   * Confirm payment
   */
  @Post('intents/:paymentIntentId/confirm')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('order:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  async confirmPayment(
    @GetTenant() tenantId: string,
    @Param('paymentIntentId') paymentIntentId: string,
  ) {
    const payment = await this.stripeService.confirmPayment(tenantId, paymentIntentId);

    return {
      success: true,
      data: payment,
      message: 'Payment confirmed',
    };
  }

  /**
   * Refund payment
   */
  @Post(':paymentId/refund')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('order:refund')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  async refund(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    const payment = await this.stripeService.refundPayment(
      tenantId,
      userId,
      paymentId,
      body.amount,
      body.reason,
    );

    return {
      success: true,
      data: payment,
      message: 'Payment refunded',
    };
  }

  /**
   * Create subscription
   */
  @Post('subscriptions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('order:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async createSubscription(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const subscription = await this.stripeService.createSubscription(
      tenantId,
      userId,
      dto,
    );

    return {
      success: true,
      data: subscription,
      message: 'Subscription created',
    };
  }

  /**
   * Cancel subscription
   */
  @Post('subscriptions/:subscriptionId/cancel')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('order:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  async cancelSubscription(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { cancelAtPeriodEnd?: boolean },
  ) {
    const subscription = await this.stripeService.cancelSubscription(
      tenantId,
      userId,
      subscriptionId,
      body.cancelAtPeriodEnd ?? true,
    );

    return {
      success: true,
      data: subscription,
      message: 'Subscription canceled',
    };
  }

  /**
   * Stripe webhook endpoint
   */
  @Post('webhook')
  @Public() // Public endpoint for Stripe webhooks
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body not available');
    }

    await this.stripeService.handleWebhook(signature, req.rawBody);

    return { received: true };
  }
}
