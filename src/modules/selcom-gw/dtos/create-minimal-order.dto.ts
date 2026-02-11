export class CreateMinimalOrderDto {
  vendor: string;
  order_id: string;
  buyer_email: string;
  buyer_name: string;
  buyer_phone: string;
  amount: number;
  currency: string;
  buyer_remarks: string;
  merchant_remarks: string;
  no_of_items: number;
  webhook?: string;
}
