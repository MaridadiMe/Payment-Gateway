import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MobilePaymentIntent } from '../dtos/mobile-payment-intent.dto';
import { SnippeRepository } from '../repositories/snippe.repository';
import { PaymentIntentRequestResponseDto } from 'src/modules/selcom-gw/dtos/payment-intent-request-response.dto';
import { Order } from 'src/modules/orders/entities/order.entity';
import { SnippeWebhookDto } from '../dtos/snippe-webhook.dto';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SnippeWebhookType } from '../enums/snippe-webhook-type';
import { PaymentEvent } from 'src/modules/orders/enums/paymentEvent.enum';

@Injectable()
export class SnippeService {
  private readonly logger = new Logger(SnippeService.name);

  constructor(
    private readonly snippeRepository: SnippeRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPaymentIntent(
    order: Order,
  ): Promise<PaymentIntentRequestResponseDto> {
    // More robust name splitting
    const nameParts = order.buyerName.trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstname;
    const dto: MobilePaymentIntent = {
      payment_type: 'mobile',
      details: {
        amount: Number(order.totalAmount),
        currency: order.currency,
      },
      phone_number: order.buyerPhone,
      customer: {
        firstname: firstname,
        lastname: lastname,
        email: order.buyerEmail,
      },
      webhook_url: this.configService.get('SNIPPE_CALLBACK_URL'),
      metadata: {
        order_id: order.reference,
      },
    };

    const response = await this.snippeRepository.createMobilePaymentIntent(dto);
    const expiry = new Date(Date.now() + 60 * 60 * 4 * 1000);

    return { request: dto, response, expiry };
  }

  async handleWebhook(
    rawBody: Buffer,
    payload: SnippeWebhookDto,
    headers: any,
  ): Promise<any> {
    try {
      this.logger.log('Received Snippe Webhook', { payload, headers });
      const isValid = this.verifyWebhookSignature(rawBody, headers);
      if (!isValid) {
        this.logger.warn('Invalid Snippe webhook signature, ignoring payload');
        return;
      }

      if (payload.type === SnippeWebhookType.COMPLETED) {
        this.logger.debug(
          'Emitting snippe.webhook event for completed payment',
        );
        this.eventEmitter.emit(PaymentEvent.SNIPPE_PAYMENT_COMPLETED, payload);
      } else if (payload.type === SnippeWebhookType.CANCELLED) {
        this.logger.debug(
          'Emitting snippe.webhook event for cancelled payment',
        );
        this.eventEmitter.emit(PaymentEvent.SNIPPE_PAYMENT_COMPLETED, payload);
      } else {
        return;
      }

      return;
    } catch (error) {
      this.logger.error('Error handling Snippe webhook', error);
    } finally {
      return;
    }
  }

  private verifyWebhookSignature(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): boolean {
    const secret = this.configService.get('SNIPPE_API_SECRET');
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];

    const message = `${timestamp}.${rawBody}`;

    const expectedSignature = createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    this.logger.debug(
      `Computed HMAC: ${expectedSignature}, Received Signature: ${signature}`,
    );

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  }
}
