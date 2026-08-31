/**
 * Serialization and buyback types
 */

export interface SerializedProduct {
  id: string;
  serialCode: string;
  variantId: string;
  lotId?: string;
  manufactureDate: Date;
  status: SerializedProductStatus;
  warehouseId?: string;
  saleRecordId?: string;
  buybackEligible: boolean;
  buybackEligibleUntil?: Date;
  buybackUsed: boolean;
  buybackUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum SerializedProductStatus {
  INVENTORY = 'inventory',
  SOLD = 'sold',
  RETURNED = 'returned',
  BUYBACK_ELIGIBLE = 'buyback_eligible',
  BUYBACK_COMPLETED = 'buyback_completed',
}

export interface SaleRecord {
  id: string;
  serialCode: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  saleDate: Date;
  buybackEligibleUntil: Date;
  buybackUsed: boolean;
  buybackUsedAt?: Date;
  buybackOrderId?: string;
}

export interface BuybackTransaction {
  id: string;
  customerId: string;
  originalOrderId: string;
  newOrderId: string;
  serialCode: string;
  benefitAmount: number;
  status: BuybackStatus;
  verifiedAt?: Date;
  deliveryPartnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BuybackStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface BuybackConfig {
  id: string;
  benefitAmount: number;
  promotionalBenefitAmount: number;
  promotionalMinOrderAmount: number;
  eligibilityWindowDays: number;
  enabled: boolean;
  eligibleCategories: string[];
  verificationMode: 'delivery_time' | 'drop_off';
}