import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway } from '../orders/enums/gateway.enum';
import { SelcomService } from '../selcom-gw/services/selcom.service';
import { SnippeService } from '../snippe-gw/services/snippe.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger();

  constructor(
    private readonly selcomService: SelcomService,
    private readonly snippeService: SnippeService,
  ) {}

  async handleWebhook(provider: string, payload: any, headers: any) {
    if (provider.toUpperCase() === PaymentGateway.SNIPPE) {
      this.logger.debug('Received Snippe webhook payload:');
      return this.snippeService.handleWebhook(payload, headers);
    } else if (provider.toUpperCase() === PaymentGateway.SELCOM) {
      this.logger.debug('Received Selcom webhook payload:');
      return this.selcomService.handleWebhook(payload, headers);
    } else {
      this.logger.warn(`Received webhook for unknown provider: ${provider}`);
      return {};
    }
  }
}
