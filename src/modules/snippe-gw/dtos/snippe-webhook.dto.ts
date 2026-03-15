import { SnippeWebhookType } from '../enums/snippe-webhook-type';

export class SnippeWebhookDto {
  id: string;
  type: SnippeWebhookType;
  api_version: string;
  created_at: Date;
  data: {
    reference: string;
    external_reference: string;
    status: string;
    amount: {
      value: number;
      currency: string;
    };
    settlement: {
      gross: {
        value: number;
        currency: string;
      };
      fees: {
        value: number;
        currency: string;
      };
      net: {
        value: number;
        currency: string;
      };
    };
    channel: {
      type: string;
      provider: string;
    };
    customer: {
      phone: string;
      name: string;
      email: string;
    };
    metadata: {
      order_id: string;
    };
    completed_at: Date;
  };
}
