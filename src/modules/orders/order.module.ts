import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { SelcomGwModule } from '../selcom-gw/selcom-gw.module';
import { PaymentIntentRepository } from './repositories/payment-intent.repository';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [SelcomGwModule],
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
