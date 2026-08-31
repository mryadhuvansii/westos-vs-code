/**
 * Shipping types
 */

export interface Shipment {
  id: string;
  orderId: string;
  warehouseId: string;
  carrierId: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  shippedAt?: Date;
  deliveredAt?: Date;
  labelUrl?: string;
  manifestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShipmentStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RTO_INITIATED = 'rto_initiated',
  RTO_DELIVERED = 'rto_delivered',
  CANCELLED = 'cancelled',
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location?: string;
  description: string;
  timestamp: Date;
  source: 'carrier' | 'manual';
}

export interface Carrier {
  id: string;
  name: string;
  code: string;
  apiConfig: Record<string, any>;
  supportedServices: string[];
  status: 'active' | 'inactive';
  priority: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrierId: string;
  serviceCode: string;
  zones: string[];
  rates: Record<string, any>;
  estimatedDays: number;
  status: 'active' | 'inactive';
}

export interface PickList {
  id: string;
  warehouseId: string;
  batchId?: string;
  items: PickListItem[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface PickListItem {
  id: string;
  pickListId: string;
  orderItemId: string;
  variantId: string;
  quantity: number;
  locationId?: string;
  picked: boolean;
}