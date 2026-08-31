/**
 * Return and refund types
 */

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  userId: string;
  status: ReturnStatus;
  reason: ReturnReason;
  items: ReturnItem[];
  resolution: ReturnResolution;
  pickupAddress?: import('./common').Address;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  PICKED_UP = 'picked_up',
  RECEIVED = 'received',
  INSPECTION_COMPLETE = 'inspection_complete',
  REFUND_INITIATED = 'refund_initiated',
  REPLACEMENT_SHIPPED = 'replacement_shipped',
  COMPLETED = 'completed',
}

export enum ReturnReason {
  SIZE_ISSUE = 'size_issue',
  FIT_ISSUE = 'fit_issue',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  DAMAGED = 'damaged',
  OTHER = 'other',
}

export enum ReturnResolution {
  REFUND = 'refund',
  REPLACEMENT = 'replacement',
  STORE_CREDIT = 'store_credit',
}

export interface ReturnItem {
  id: string;
  returnRequestId: string;
  orderItemId: string;
  variantId: string;
  quantity: number;
  condition: ReturnCondition;
  disposition?: ReturnDisposition;
  restockWarehouseId?: string;
}

export enum ReturnCondition {
  NEW = 'new',
  USED = 'used',
  DAMAGED = 'damaged',
  MISSING_TAGS = 'missing_tags',
}

export enum ReturnDisposition {
  RESTOCK = 'restock',
  WRITE_OFF = 'write_off',
  QUALITY_HOLD = 'quality_hold',
  REPAIR = 'repair',
}

export interface Refund {
  id: string;
  returnRequestId?: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  method: RefundMethod;
  status: RefundStatus;
  processedAt?: Date;
  providerRefundId?: string;
  createdAt: Date;
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
  BANK_TRANSFER = 'bank_transfer',
}

import type { RefundStatus as _RefundStatus } from './payment';
export type RefundStatus = _RefundStatus;