import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaymentIntent } from '../entities/payment-intent.entity';

@Injectable()
export class PaymentIntentRepository extends BaseRepository<PaymentIntent> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, PaymentIntent);
  }
}
