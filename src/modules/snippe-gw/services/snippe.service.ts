import { Injectable, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletPullPaymentDto } from 'src/modules/orders/wallet-pull-payment.dto';
import { SnippeClient } from 'src/modules/restclient/snippeClient.service';
import { MobilePaymentIntent } from '../dtos/mobile-payment-intent.dto';
import { SnippeApiResponseDto } from '../dtos/snippe-api-response.dto';
import { SNIPPE_PAYMENT_ENDPOINT } from '../constants/snippe-constants';

@Injectable()
export class SnippeService {
  constructor(
    private readonly snippeClient: SnippeClient,
    private readonly configService: ConfigService,
  ) {}

  async createMobilePaymentIntent(
    dto: MobilePaymentIntent,
  ): Promise<SnippeApiResponseDto> {
    const path = SNIPPE_PAYMENT_ENDPOINT;
    const url = `${this.configService.get('SNIPPE_API_BASE_URL')}${path}`;

    const headers = {
      Authorization: `Bearer ${this.configService.get('SNIPPE_API_KEY')}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${dto.metadata.order_id}`,
    };

    return this.snippeClient.request({
      url,
      method: RequestMethod.POST,
      payload: dto,
      headers,
    }) as Promise<SnippeApiResponseDto>;
  }
}
