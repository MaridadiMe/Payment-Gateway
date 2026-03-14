import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MobilePaymentIntent } from '../dtos/mobile-payment-intent.dto';
import { SnippeRepository } from '../repositories/snippe.repository';
import { PaymentIntentRequestResponseDto } from 'src/modules/selcom-gw/dtos/payment-intent-request-response.dto';
import { Order } from 'src/modules/orders/entities/order.entity';
import { first } from 'rxjs';

@Injectable()
export class SnippeService {
  private readonly logger = new Logger(SnippeService.name);

  constructor(
    private readonly snippeRepository: SnippeRepository,
    private readonly configService: ConfigService,
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
        amount: 500,
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
    const expiry = new Date(Date.now() + 60 * 60 * 24 * 4 * 1000);

    return { request: dto, response, expiry };
  }

  async handleWebhook(payload: any, headers: any): Promise<any> {
    // Add Logic Later
    this.logger.log('Received Snippe Webhook', { payload, headers });
    return {};
  }
}
