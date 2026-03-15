import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { PublicRoute } from '../auth/decorators/public-route.decorator';
import { WebhookService } from './webhook.service';

@Controller('hook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @PublicRoute()
  @Post(':id')
  async handleWebhook(
    @Param('id') provider: string,

    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ) {
    const payload = req.body;
    const rawBody = req.rawBody;
    return await this.webhookService.handleWebhook(
      provider,
      rawBody,
      payload,
      headers,
    );
  }
}
