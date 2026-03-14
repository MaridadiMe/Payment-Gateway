export class MobilePaymentIntent {
  payment_type: string;
  details: {
    amount: number;
    currency: string;
  };
  phone_number: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  webhook_url: string;
  metadata: {
    order_id: string;
  };
}
