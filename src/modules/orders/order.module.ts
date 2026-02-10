import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';

@Module({
  imports: [],
  providers: [OrderRepository, OrderService],
  controllers: [OrderController],
  exports: [],
})
export class OrderModule {}
