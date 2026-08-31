/**
 * Payment types
 */

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  transactionId: string;
  providerReference?: string;
  amount: number;
  currency: import('./pricing').Currency;
  method: PaymentMethod;
  provider: string;
  status: PaymentProviderStatus;
  authorizedAt?: Date;
  capturedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  idempotencyKey: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  CARD = 'card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
  COD = 'cod',
}

export enum PaymentProviderStatus {
  INITIATED = 'initiated',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export type PaymentStatus = PaymentProviderStatus;

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  providerRefundId?: string;
  processedAt?: Date;
}

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}