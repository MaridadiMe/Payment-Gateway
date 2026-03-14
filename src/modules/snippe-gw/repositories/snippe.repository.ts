import { Injectable, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SnippeClient } from 'src/modules/restclient/snippeClient.service';
import { SNIPPE_PAYMENT_ENDPOINT } from '../constants/snippe-constants';
import { MobilePaymentIntent } from '../dtos/mobile-payment-intent.dto';
import { SnippeApiResponseDto } from '../dtos/snippe-api-response.dto';

@Injectable()
export class SnippeRepository {
  constructor(
    private readonly snippeClient: SnippeClient,
    private readonly configService: ConfigService,
  ) {}

  async createMobilePaymentIntent(
    dto: MobilePaymentIntent,
  ): Promise<SnippeApiResponseDto> {
    const url = `${this.configService.get('SNIPPE_API_BASE_URL')}${SNIPPE_PAYMENT_ENDPOINT}`;

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
