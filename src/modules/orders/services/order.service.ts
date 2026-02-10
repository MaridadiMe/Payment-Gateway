import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Order } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { User } from 'src/modules/auth/types/user.type';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    protected readonly OrderRepository: OrderRepository,
    private readonly dataSource: DataSource,
  ) {
    super(OrderRepository);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.findAll();
  }
}
