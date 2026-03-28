// src/core/rabbitmq/rabbitmq.publisher.ts
import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class RabbitMQPublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(routingKey: string, data: any) {
    const channel = await this.rabbitMQService.getChannel(); // 👈 await!

    const exchange = process.env.RABBITMQ_EXCHANGE || 'events.exchange';
    this.logger.log(
      `Publishing message to exchange "${exchange}" with routing key "${routingKey}"`,
    );

    const nestFormatPayload = {
      data,
      pattern: routingKey,
    };

    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(nestFormatPayload)),
      {
        persistent: true,
      },
    );

    this.logger.log('Message published to RabbitMQ');
  }
}
