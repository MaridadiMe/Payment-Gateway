export enum OrderStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentProvider {
  SELCOM = 'SELCOM',
  MPESA = 'MPESA',
  AIRTEL = 'AIRTEL',
}

export enum PaymentIntentStatus {
  CREATED = 'CREATED',
  EXPIRED = 'EXPIRED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
