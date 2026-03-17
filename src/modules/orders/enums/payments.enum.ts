export enum OrderStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentProvider {
  SELCOM = 'SELCOM',
  MPESA = 'MPESA',
  SNIPPE = 'SNIPPE',
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
