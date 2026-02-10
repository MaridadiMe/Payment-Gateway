import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Order } from '../entities/order.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Order);
  }
}
