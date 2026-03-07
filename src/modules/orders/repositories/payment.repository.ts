import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Payment);
  }
}
