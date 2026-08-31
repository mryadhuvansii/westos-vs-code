/**
 * Cart and checkout types
 */

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  status: CartStatus;
  items: CartItem[];
  couponCode?: string;
  coupon?: import('./coupon').Coupon;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum CartStatus {
  ACTIVE = 'active',
  CONVERTED = 'converted',
  ABANDONED = 'abandoned',
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  variant?: import('./product').ProductVariant;
  quantity: number;
  priceSnapshot: PriceSnapshot;
  addedAt: Date;
}

export interface PriceSnapshot {
  mrp: number;
  sellingPrice: number;
  discount: number;
  tax: number;
  total: number;
  currency: import('./pricing').Currency;
}

export interface CheckoutSession {
  id: string;
  userId?: string;
  sessionId?: string;
  cartId: string;
  status: CheckoutStatus;
  step: CheckoutStep;
  shippingAddress?: import('./common').Address;
  billingAddress?: import('./common').Address;
  shippingMethodId?: string;
  paymentMethodId?: string;
  idempotencyKey?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum CheckoutStatus {
  PENDING = 'pending',
  ADDRESS = 'address',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum CheckoutStep {
  ADDRESS = 'address',
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
}