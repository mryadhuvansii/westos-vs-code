/**
 * Pricing and discount types
 */

export interface Price {
  amount: number;
  currency: Currency;
  formatted?: string;
}

export enum Currency {
  INR = 'INR',
}

export interface PricingRule {
  id: string;
  name: string;
  type: PricingRuleType;
  conditions: Record<string, any>;
  value: number;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
}

export enum PricingRuleType {
  AUTO_DISCOUNT = 'auto_discount',
  PROMOTION = 'promotion',
}

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  priority: number;
  conditions: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export interface Lot {
  id: string;
  code: string;
  name: string;
  description?: string;
  products: string[];
  status: 'active' | 'inactive';
  returnPolicyDays?: number;
  discountType?: DiscountType;
  discountValue?: number;
  metadata?: Record<string, any>;
}

export interface Combo {
  id: string;
  name: string;
  type: ComboType;
  configuration: Record<string, any>;
  discount: Discount;
  status: 'active' | 'inactive';
}

export enum ComboType {
  BUNDLE = 'bundle',
  BUY_X_GET_Y = 'buy_x_get_y',
  TIERED = 'tiered',
}