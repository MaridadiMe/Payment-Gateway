import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payments.enum';
import { Order } from './order.entity';
import { PaymentIntent } from './payment-intent.entity';

@Entity('PAYMENTS')
export class Payment extends BaseEntity {
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => PaymentIntent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paymentIntentId' })
  paymentIntent: PaymentIntent;

  /**
   * Selcom transaction id / PSP transaction reference
   */
  @Column({ length: 100, unique: true })
  providerTransactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @Column()
  paidAt: Date;

  @Column({ type: 'json', nullable: true })
  providerPayload?: Record<string, any>;
}
