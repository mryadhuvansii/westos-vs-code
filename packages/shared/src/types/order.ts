/**
 * Order types
 */

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currency: import('./pricing').Currency;
  billingAddress: import('./common').Address;
  shippingAddress: import('./common').Address;
  paymentStatus: import('./payment').PaymentStatus;
  notes?: string;
  source: OrderSource;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
}

import type { PaymentStatus as _PaymentStatus } from './payment';
export type PaymentStatus = _PaymentStatus;

export enum OrderSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN = 'admin',
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  variant?: import('./product').ProductVariant;
  productSnapshot: ProductSnapshot;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  serializedProductCodes?: string[];
}

export interface ProductSnapshot {
  id: string;
  name: string;
  slug: string;
  brand: string;
  variant: {
    size: string;
    color: string;
    sku: string;
  };
  media: import('./product').ProductMedia[];
}