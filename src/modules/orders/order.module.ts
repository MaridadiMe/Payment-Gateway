import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { SelcomGwModule } from '../selcom-gw/selcom-gw.module';
import { PaymentIntentRepository } from './repositories/payment-intent.repository';
import { PaymentRepository } from './repositories/payment.repository';
import { SnippeModule } from '../snippe-gw/snippe.module';
import { RabbitMqModule } from '../rabbitMq/rabbitMq.module';

@Module({
  imports: [SelcomGwModule, SnippeModule, RabbitMqModule],
  providers: [
    OrderRepository,
    OrderService,
    PaymentIntentRepository,
    PaymentRepository,
  ],
  controllers: [OrderController],
  exports: [],
})
export class OrderModule {}
