/**
 * Inventory and warehouse types
 */

export interface Inventory {
  id: string;
  variantId: string;
  warehouseId: string;
  locationId?: string;
  onHand: number;
  reserved: number;
  incoming: number;
  damaged: number;
  unavailable: number;
  available: number;
  lastUpdated: Date;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contact?: string;
  capacity?: number;
  status: WarehouseStatus;
  priority: number;
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  code: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
}