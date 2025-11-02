import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { PaymentMethodEntity } from './entities/payment-method.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

export interface CreatePaymentIntentDto {
  amount: number;
  currency?: string;
  customerId?: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, any>;
  paymentMethodId?: string;
  receiptEmail?: string;
}

export interface CreateSubscriptionDto {
  customerId: string;
  priceId: string;
  productId?: string;
  planName: string;
  description?: string;
  trialDays?: number;
  metadata?: Record<string, any>;
  couponCode?: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepository: Repository<PaymentMethodEntity>,
    private readonly auditService: AuditService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-10-28.acacia',
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    tenantId: string,
    userId: string,
    dto: CreatePaymentIntentDto,
  ): Promise<{ payment: Payment; clientSecret: string }> {
    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(dto.amount * 100), // Convert to cents
        currency: dto.currency || 'usd',
        customer: dto.customerId,
        payment_method: dto.paymentMethodId,
        description: dto.description,
        receipt_email: dto.receiptEmail,
        metadata: {
          tenantId,
          orderId: dto.orderId,
          ...dto.metadata,
        },
        automatic_payment_methods: dto.paymentMethodId
          ? undefined
          : { enabled: true },
      });

      // Create local payment record
      const payment = this.paymentRepository.create({
        tenantId,
        orderId: dto.orderId,
        customerId: dto.customerId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: dto.customerId,
        status: PaymentStatus.PENDING,
        amount: dto.amount,
        currency: (dto.currency || 'usd') as any,
        description: dto.description,
        metadata: dto.metadata,
        receiptEmail: dto.receiptEmail,
      });

      await this.paymentRepository.save(payment);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.CREATE,
        resource: 'payment',
        resourceId: payment.id,
        description: `Created payment intent for order ${dto.orderId}`,
        metadata: { amount: dto.amount, currency: dto.currency },
      });

      return {
        payment,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw new BadRequestException(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    tenantId: string,
    paymentIntentId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { tenantId, stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      payment.status = this.mapStripeStatus(paymentIntent.status);
      payment.stripeChargeId = paymentIntent.latest_charge as string;
      payment.paymentMethodDetails = paymentIntent.payment_method
        ? (paymentIntent.payment_method as any)
        : undefined;

      if (paymentIntent.status === 'succeeded') {
        payment.paidAt = new Date();
      }

      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      this.logger.error(`Failed to confirm payment: ${error.message}`);
      throw new BadRequestException(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    tenantId: string,
    userId: string,
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { tenantId, id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (!payment.canRefund()) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    try {
      const refundAmount = amount || payment.getRefundableAmount();

      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100),
        reason: reason as any,
        metadata: { tenantId, userId },
      });

      payment.amountRefunded += refundAmount;
      payment.stripeRefundId = refund.id;

      if (payment.isFullyRefunded()) {
        payment.status = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();
      } else {
        payment.status = PaymentStatus.PARTIALLY_REFUNDED;
      }

      await this.paymentRepository.save(payment);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.CREATE,
        resource: 'refund',
        resourceId: payment.id,
        description: `Refunded ${refundAmount} for payment ${paymentId}`,
        metadata: { amount: refundAmount, reason },
      });

      return payment;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw new BadRequestException(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    tenantId: string,
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    try {
      const createParams: Stripe.SubscriptionCreateParams = {
        customer: dto.customerId,
        items: [{ price: dto.priceId }],
        metadata: {
          tenantId,
          ...dto.metadata,
        },
      };

      if (dto.trialDays) {
        createParams.trial_period_days = dto.trialDays;
      }

      if (dto.couponCode) {
        createParams.coupon = dto.couponCode;
      }

      const stripeSubscription = await this.stripe.subscriptions.create(createParams);

      // Get price details
      const price = await this.stripe.prices.retrieve(dto.priceId);

      const subscription = this.subscriptionRepository.create({
        tenantId,
        customerId: dto.customerId,
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: dto.customerId,
        stripePriceId: dto.priceId,
        stripeProductId: price.product as string,
        productId: dto.productId,
        planName: dto.planName,
        description: dto.description,
        status: this.mapSubscriptionStatus(stripeSubscription.status),
        interval: price.recurring?.interval as any,
        intervalCount: price.recurring?.interval_count || 1,
        amount: (price.unit_amount || 0) / 100,
        currency: price.currency,
        trialDays: dto.trialDays,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : undefined,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : undefined,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        metadata: dto.metadata,
        couponCode: dto.couponCode,
      });

      await this.subscriptionRepository.save(subscription);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.CREATE,
        resource: 'subscription',
        resourceId: subscription.id,
        description: `Created subscription ${dto.planName}`,
        metadata: { priceId: dto.priceId, customerId: dto.customerId },
      });

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: string,
    userId: string,
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId, id: subscriptionId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    try {
      const stripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      );

      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      subscription.canceledAt = new Date();

      if (stripeSubscription.cancel_at) {
        subscription.cancelAt = new Date(stripeSubscription.cancel_at * 1000);
      }

      if (!cancelAtPeriodEnd) {
        subscription.status = SubscriptionStatus.CANCELED;
        subscription.endedAt = new Date();
      }

      await this.subscriptionRepository.save(subscription);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.UPDATE,
        resource: 'subscription',
        resourceId: subscription.id,
        description: `Canceled subscription ${subscription.planName}`,
        metadata: { cancelAtPeriodEnd },
      });

      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map Stripe payment status to local status
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.PENDING,
      processing: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.SUCCEEDED,
      canceled: PaymentStatus.CANCELED,
    };

    return statusMap[stripeStatus] || PaymentStatus.FAILED;
  }

  /**
   * Map Stripe subscription status to local status
   */
  private mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      unpaid: SubscriptionStatus.UNPAID,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      trialing: SubscriptionStatus.TRIALING,
      paused: SubscriptionStatus.PAUSED,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.CANCELED;
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.SUCCEEDED;
      payment.paidAt = new Date();
      payment.stripeChargeId = paymentIntent.latest_charge as string;
      await this.paymentRepository.save(payment);

      this.logger.log(`Payment ${payment.id} succeeded`);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.failureCode = paymentIntent.last_payment_error?.code;
      payment.failureMessage = paymentIntent.last_payment_error?.message;
      await this.paymentRepository.save(payment);

      this.logger.log(`Payment ${payment.id} failed`);
    }
  }

  /**
   * Handle subscription update
   */
  private async handleSubscriptionUpdate(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = this.mapSubscriptionStatus(stripeSubscription.status);
      subscription.currentPeriodStart = new Date(
        stripeSubscription.current_period_start * 1000,
      );
      subscription.currentPeriodEnd = new Date(
        stripeSubscription.current_period_end * 1000,
      );

      await this.subscriptionRepository.save(subscription);

      this.logger.log(`Subscription ${subscription.id} updated`);
    }
  }

  /**
   * Handle subscription deletion
   */
  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endedAt = new Date();

      await this.subscriptionRepository.save(subscription);

      this.logger.log(`Subscription ${subscription.id} deleted`);
    }
  }
}
