// src/core/rabbitmq/rabbitmq.publisher.ts
import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(routingKey: string, data: any) {
    const channel = await this.rabbitMQService.getChannel(); // 👈 await!

    const exchange = process.env.RABBITMQ_EXCHANGE || 'events.exchange';

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  }
}
