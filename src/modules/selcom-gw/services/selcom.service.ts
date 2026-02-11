import { Injectable, RequestMethod } from '@nestjs/common';
import { RestclientService } from 'src/modules/restclient/restclient.service';
import { SelcomUtils } from '../utils/selcom';
import { SELCOM_BASE_URL } from '../constants/selcom.constants';
import { CreateMinimalOrderDto } from '../dtos/create-minimal-order.dto';
import { SelcomClientService } from 'src/modules/restclient/selcomClient.service';
import { SelcomApiResponseDto } from '../dtos/selcom-api-response.dto';

@Injectable()
export class SelcomService {
  constructor(private readonly restClient: SelcomClientService) {}

  async createMinimalOrder(
    dto: CreateMinimalOrderDto,
  ): Promise<SelcomApiResponseDto> {
    const path = '/v1/checkout/create-order-minimal';
    const url = `${SELCOM_BASE_URL}${path}`;

    const headers = SelcomUtils.generateHeaders(dto);

    return this.restClient.request({
      url,
      method: RequestMethod.POST,
      payload: dto,
      headers,
    }) as Promise<SelcomApiResponseDto>;
  }
}
