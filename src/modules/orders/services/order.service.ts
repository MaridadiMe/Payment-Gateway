import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Order } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { User } from 'src/modules/auth/types/user.type';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { SelcomService } from 'src/modules/selcom-gw/services/selcom.service';
import {
  OrderStatus,
  PaymentIntentStatus,
  PaymentProvider,
  PaymentStatus,
} from '../enums/payments.enum';
import { CreateMinimalOrderDto } from 'src/modules/selcom-gw/dtos/create-minimal-order.dto';
import { format } from 'date-fns';
import {
  SELCOM_CALLBACK_URL,
  VENDOR_TILL,
} from 'src/modules/selcom-gw/constants/selcom.constants';
import Decimal from 'decimal.js';
import { SelcomUtils } from 'src/modules/selcom-gw/utils/selcom';
import { PaymentIntentRepository } from '../repositories/payment-intent.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../enums/gateway.enum';
import { SnippeService } from 'src/modules/snippe-gw/services/snippe.service';
import { PaymentIntentRequestResponseDto } from 'src/modules/selcom-gw/dtos/payment-intent-request-response.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentEvent } from '../enums/paymentEvent.enum';
import { SnippeWebhookDto } from 'src/modules/snippe-gw/dtos/snippe-webhook.dto';
import { DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentIntent } from '../entities/payment-intent.entity';
import { RabbitMQPublisher } from 'src/modules/rabbitMq/rabbitMq.publisher';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    protected readonly orderRepository: OrderRepository,
    private readonly paymentIntentRepository: PaymentIntentRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly selcomService: SelcomService,
    private readonly snippeService: SnippeService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly rabbitMQPublisher: RabbitMQPublisher,
  ) {
    super(orderRepository);
  }

  async findAllOrders(): Promise<Order[]> {
    return this.findAll();
  }

  async createOrder(payload: CreateOrderDto, user: User): Promise<Order> {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { clientReference: payload.clientReference, clientId: user.id },
      });

      if (existingOrder) {
        return this.handleExistingOrder(existingOrder, payload, user);
      }

      return this.handleNewOrder(payload, user);
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while creating the order',
      );
    }
  }

  private async handleExistingOrder(
    existingOrder: Order,
    dto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    // if order has already been paid, just return the existing order without making any changes
    if (existingOrder.status === OrderStatus.PAID) {
      return existingOrder;
    }

    // if is open, check if there is an intent that is not expired, if there is, what should we do?
    if (existingOrder.status === OrderStatus.OPEN) {
      // check if there is an intent that is not expired
      const existingIntent = await this.paymentIntentRepository.findOne({
        where: {
          order: { id: existingOrder.id },
          status: PaymentIntentStatus.CREATED,
        },
      });

      if (existingIntent) {
        // Close that intent
        existingIntent.status = PaymentIntentStatus.EXPIRED;
      }

      const gateWay = this.getBestGateway();

      const upstreamIntent: PaymentIntentRequestResponseDto =
        await this.handleUpstreamPaymentIntent(existingOrder, gateWay);

      //save new payment Intent
      const intent = this.paymentIntentRepository.create({
        order: existingOrder,
        provider: PaymentProvider[gateWay],
        providerOrderRef: existingOrder.reference,
        status: PaymentIntentStatus.CREATED,
        expiresAt: upstreamIntent.expiry,
        providerRequest: upstreamIntent.request,
        providerResponse: upstreamIntent.response,
        createdBy: user.userName,
      });

      await this.paymentIntentRepository.save(intent);

      return existingOrder;
    }

    // if the intent is expired, create a new intent and the cycle continues as normal

    return existingOrder;
  }

  private async handleNewOrder(payload: CreateOrderDto, user: User) {
    try {
      const newOrder = this.orderRepository.create({
        ...payload,
        reference: format(new Date(), 'yyyyMMddHHmmssSSS'),
        createdBy: user.userName,
        clientId: user.id,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await this.orderRepository.save(newOrder);
      const gateWay = this.getBestGateway();

      const upstreamIntent: PaymentIntentRequestResponseDto =
        await this.handleUpstreamPaymentIntent(savedOrder, gateWay);

      //save payment Intent
      const intent = this.paymentIntentRepository.create({
        order: savedOrder,
        provider: PaymentProvider[gateWay],
        providerOrderRef: savedOrder.reference,
        status: PaymentIntentStatus.CREATED,
        expiresAt: upstreamIntent.expiry,
        providerRequest: upstreamIntent.request,
        providerResponse: upstreamIntent.response,
        createdBy: user.userName,
      });

      await this.paymentIntentRepository.save(intent);

      return savedOrder;
    } catch (error) {
      this.logger.error(
        `Error handling new order: ${error.message}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'An error occurred while processing the order, try again later',
      );
    }
  }

  private getBestGateway(): PaymentGateway {
    // For simplicity, we are returning Snippe as the best gateway. In a real-world scenario, you would implement logic to determine the best gateway based on factors like cost, reliability, and user preferences.
    return PaymentGateway.SNIPPE;
  }

  private async handleUpstreamPaymentIntent(
    order: Order,
    gateway: PaymentGateway,
  ): Promise<PaymentIntentRequestResponseDto> {
    // This probably needs to be a factory method that returns the appropriate service based on the gateway
    if (gateway === PaymentGateway.SNIPPE) {
      return this.snippeService.createPaymentIntent(order);
    } else {
      return this.createSelcomMinimalOrder(order);
    }
  }

  private async createSelcomMinimalOrder(savedOrder: Order): Promise<any> {
    try {
      const selcomMinimalOrderDto: CreateMinimalOrderDto = {
        vendor: VENDOR_TILL,
        order_id: savedOrder.reference,
        buyer_email: savedOrder.buyerEmail,
        buyer_name: savedOrder.buyerName,
        buyer_phone: savedOrder.buyerPhone,
        amount: new Decimal(savedOrder.totalAmount).toNumber(),
        currency: savedOrder.currency,
        buyer_remarks: savedOrder.description || 'Order Payment',
        merchant_remarks: 'Order Payment',
        no_of_items: 1,
        webhook: SelcomUtils.stringToBase64(
          this.configService.get<string>('SELCOM_CALLBACK_URL'),
        ),
      };

      const response = await this.selcomService.createMinimalOrder(
        selcomMinimalOrderDto,
      );

      return { selcomReq: selcomMinimalOrderDto, selcomResponse: response };
    } catch (error) {
      this.logger.error(
        `Error creating Selcom minimal order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while creating the order with Selcom',
      );
    }
  }

  @OnEvent(PaymentEvent.SNIPPE_PAYMENT_COMPLETED)
  async handleSnippePaymentCompleted(payload: SnippeWebhookDto) {
    await this.dataSource
      .transaction(async (manager) => {
        const orderRepo = manager.getRepository(Order);
        const paymentRepo = manager.getRepository(Payment);
        const paymentIntentRepo = manager.getRepository(PaymentIntent);

        const order = await orderRepo.findOne({
          where: {
            reference: payload.data.metadata.order_id,
            status: OrderStatus.OPEN,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!order) return;

        if (new Decimal(order.totalAmount).equals(payload.data.amount.value)) {
          order.status = OrderStatus.PAID;
          this.logger.debug(
            `Order ${order.reference} is fully paid. Received amount: ${payload.data.amount.value}, Order total: ${order.totalAmount}`,
          );
        } else if (
          new Decimal(order.totalAmount).greaterThan(payload.data.amount.value)
        ) {
          order.status = OrderStatus.PARTIALLY_PAID;
          this.logger.debug(
            `Order ${order.reference} is partially paid. Received amount: ${payload.data.amount.value}, Order total: ${order.totalAmount}`,
          );
        } else {
          order.status = OrderStatus.PAID;
          this.logger.debug(
            `Order ${order.reference} is Over paid. Received amount: ${payload.data.amount.value}, Order total: ${order.totalAmount}`,
          );
          return;
        }

        const paymentIntent = await paymentIntentRepo.findOne({
          where: {
            order: { id: order.id },
            provider: PaymentProvider.SNIPPE,
            status: PaymentIntentStatus.CREATED,
          },
        });

        if (!paymentIntent) {
          this.logger.warn(
            `No payment intent found for order ${order.reference} and provider ${PaymentProvider.SNIPPE}`,
          );
          return;
        }

        // check if payment already exists
        const exists = await paymentRepo.findOne({
          where: {
            providerTransactionId: payload.data.reference,
          },
        });

        if (exists) {
          this.logger.warn(
            `Payment with provider transaction id ${payload.data.reference} already exists, skipping creation`,
          );
          return;
        }

        const payment = paymentRepo.create({
          order,
          paymentIntent,
          providerTransactionId: payload.data.reference,
          paidAt: new Date(payload.data.completed_at),
          status: PaymentStatus.SUCCESS,
          providerPayload: payload,
        });

        await paymentRepo.save(payment);

        // (Optional but IMPORTANT) update payment intent status
        paymentIntent.status = PaymentIntentStatus.PAID;

        await orderRepo.save(order);
        await paymentIntentRepo.save(paymentIntent);

        // Publish an event to RabbitMQ for other services to consume
        const routingKey = `payment.completed.${order.createdBy?.toLowerCase()}`;
        await this.rabbitMQPublisher.publish(routingKey, {
          orderReference: order.reference,
          clientReference: order.clientReference,
          status: order.status,
          transactionReference: payload.data.reference,
        });
      })
      .catch((error) => {
        this.logger.error(
          `Error handling Snippe payment completed event: ${error.message}`,
          error.stack,
        );
      });
  }
}
