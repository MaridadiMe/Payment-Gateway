import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Entity,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PaymentProvider, PaymentIntentStatus } from '../enums/payments.enum';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity('PAYMENT_INTENTS')
export class PaymentIntent extends BaseEntity {
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  /**
   * Selcom order_id / PSP reference
   */
  @Column({ length: 100 })
  providerOrderRef: string;

  @Column({
    type: 'enum',
    enum: PaymentIntentStatus,
    default: PaymentIntentStatus.CREATED,
  })
  status: PaymentIntentStatus;

  @Column({ nullable: true })
  expiresAt?: Date;

  /**
   * Store exact payloads for audit/debug
   */
  @Column({ type: 'json', nullable: true })
  providerRequest?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  providerResponse?: Record<string, any>;

  @OneToMany(() => Payment, (p) => p.paymentIntent)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;
}
