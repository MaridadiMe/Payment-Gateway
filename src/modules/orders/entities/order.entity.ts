import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/payments.enum';
import { PaymentIntent } from './payment-intent.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'ORDERS' })
export class Order extends BaseEntity {
  @Column({ unique: true, length: 50 })
  reference: string;

  @Column({ length: 150, nullable: false })
  buyerName: string;

  @Column({ length: 150, nullable: true })
  buyerEmail: string;

  @Column({ length: 20, nullable: false })
  buyerPhone: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: string;

  @Column({ length: 3 })
  currency: string; // TZS, USD

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.OPEN,
  })
  status: OrderStatus;

  @OneToMany(() => PaymentIntent, (pi) => pi.order)
  paymentIntents: PaymentIntent[];

  @OneToMany(() => Payment, (pi) => pi.order)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
