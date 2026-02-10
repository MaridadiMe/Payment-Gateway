import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/common/controllers/base.controller';
import { OrderService } from '../services/order.service';
import { Order } from '../entities/order.entity';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/modules/auth/decorators/authenticated-user.decorator';
import { User } from 'src/modules/auth/types/user.type';
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrderController extends BaseController<Order> {
  constructor(protected readonly service: OrderService) {
    super(service);
  }

  @Get()
  @HttpCode(200)
  @Permissions('VIEW_VEHICLES')
  async findAll(): Promise<BaseResponseDto<Order[]>> {
    const vehicles = await this.service.findAllOrders();
    return new BaseResponseDto(vehicles);
  }
}
