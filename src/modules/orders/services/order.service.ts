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
import { OrderStatus } from '../enums/payments.enum';
import { CreateMinimalOrderDto } from 'src/modules/selcom-gw/dtos/create-minimal-order.dto';
import { format } from 'date-fns';
import {
  SELCOM_CALLBACK_URL,
  VENDOR_TILL,
} from 'src/modules/selcom-gw/constants/selcom.constants';
import Decimal from 'decimal.js';
import { SelcomUtils } from 'src/modules/selcom-gw/utils/selcom';

@Injectable()
export class OrderService extends BaseService<Order> {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    protected readonly orderRepository: OrderRepository,
    private readonly selcomService: SelcomService,
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
        return existingOrder;
      }

      const newOrder = this.orderRepository.create({
        ...payload,
        reference: format(new Date(), 'yyyyMMddHHmmssSSS'),
        createdBy: user.userName,
        clientId: user.id,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await this.orderRepository.save(newOrder);

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
        webhook: SelcomUtils.stringToBase64(SELCOM_CALLBACK_URL),
      };

      const response = await this.selcomService.createMinimalOrder(
        selcomMinimalOrderDto,
      );

      return savedOrder;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'An error occurred while creating the order',
      );
    }
  }
}
