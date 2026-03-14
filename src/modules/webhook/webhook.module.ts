import { Module } from '@nestjs/common';
import { SelcomGwModule } from '../selcom-gw/selcom-gw.module';
import { SnippeModule } from '../snippe-gw/snippe.module';
import { WebhookController } from './webook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [SelcomGwModule, SnippeModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
