import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { PublicRoute } from '../auth/decorators/public-route.decorator';
import { WebhookService } from './webhook.service';

@Controller('hook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @PublicRoute()
  @Post(':id')
  async handleWebhook(
    @Param('id') provider: string,
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
  ) {
    return await this.webhookService.handleWebhook(provider, payload, headers);
  }
}
