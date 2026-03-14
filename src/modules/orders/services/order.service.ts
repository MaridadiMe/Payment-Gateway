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
} from '../enums/payments.enum';
import { CreateMinimalOrderDto } from 'src/modules/selcom-gw/dtos/create-minimal-order.dto';
import { format } from 'date-fns';
import {
  SELCOM_CALLBACK_URL,
  VENDOR_TILL,
} from 'src/modules/selcom-gw/constants/selcom.constants';
import Decimal from 'decimal.js';
import { SelcomUtils } from 'src/modules/selcom-gw/utils/selcom';
import { SelcomResult } from 'src/modules/selcom-gw/dtos/selcom-api-response.dto';
import { WalletPullPaymentDto } from '../wallet-pull-payment.dto';
import { PaymentIntentRepository } from '../repositories/payment-intent.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../enums/gateway.enum';
import { SnippeService } from 'src/modules/snippe-gw/services/snippe.service';
import { PaymentIntentRequestResponseDto } from 'src/modules/selcom-gw/dtos/payment-intent-request-response.dto';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    protected readonly orderRepository: OrderRepository,
    private readonly paymentIntentRepository: PaymentIntentRepository,
    private readonly selcomService: SelcomService,
    private readonly snippeService: SnippeService,
    private readonly configService: ConfigService,
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
        return this.handleExistingOrder(existingOrder, payload);
      }

      return this.handleNewOrder(payload, user);
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while creating the order',
      );
    }
  }

  private handleExistingOrder(
    existingOrder: Order,
    dto: CreateOrderDto,
  ): Order {
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
        provider: PaymentProvider.SELCOM,
        providerOrderRef: savedOrder.reference, // this should ideally come from the upstream gateway response
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

  // private async handleNewOrder(
  //   payload: CreateOrderDto,
  //   user: User,
  // ): Promise<Order> {
  //   try {
  //     const newOrder = this.orderRepository.create({
  //       ...payload,
  //       reference: format(new Date(), 'yyyyMMddHHmmssSSS'),
  //       createdBy: user.userName,
  //       clientId: user.id,
  //       status: OrderStatus.OPEN,
  //     });

  //     const savedOrder = await this.orderRepository.save(newOrder);

  //     const { selcomReq, selcomResponse } = await this.createSelcomMinimalOrder(
  //       savedOrder,
  //       user,
  //     );

  //     //save payment Intent
  //     const intent = this.paymentIntentRepository.create({
  //       order: savedOrder,
  //       provider: PaymentProvider.SELCOM,
  //       providerOrderRef: selcomReq.order_id,
  //       status: PaymentIntentStatus.CREATED,
  //       expiresAt: new Date(Date.now() + 60 * 60 * 1000), // expires in 60 mins
  //       providerRequest: selcomReq,
  //       providerResponse: selcomResponse,
  //       createdBy: user.userName,
  //     });

  //     const savedIntent = await this.paymentIntentRepository.save(intent);

  //     if (
  //       selcomResponse.result == SelcomResult.SUCCESS &&
  //       payload.pullFromWalllet
  //     ) {
  //       // Pull From Wallet
  //       const payload: WalletPullPaymentDto = {
  //         transid: intent.id,
  //         order_id: savedOrder.reference,
  //         msisdn: savedOrder.buyerPhone,
  //       };

  //       const pullResponse =
  //         await this.selcomService.walletPullPayment(payload);
  //     }

  //     return savedOrder;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error handling new order: ${error.message}`,
  //       error.stack,
  //     );
  //     throw new InternalServerErrorException(
  //       'An error occurred while processing the order',
  //     );
  //   }
  // }

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
}
