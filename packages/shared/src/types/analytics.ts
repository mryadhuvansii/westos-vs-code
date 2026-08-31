/**
 * Analytics and marketing types
 */

export interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface DailyAggregate {
  id: string;
  date: Date;
  metric: string;
  value: number;
  dimensions: Record<string, any>;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  startDate: Date;
  endDate: Date;
  targetSegments: string[];
  couponIds: string[];
  status: CampaignStatus;
  budget?: number;
  spent?: number;
}

export enum CampaignType {
  SEASONAL = 'seasonal',
  FLASH_SALE = 'flash_sale',
  NEW_ARRIVAL = 'new_arrival',
  CLEARANCE = 'clearance',
  LOYALTY = 'loyalty',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export interface CustomerSegment {
  id: string;
  name: string;
  type: SegmentType;
  rules: SegmentRule[];
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum SegmentType {
  RFM = 'rfm',
  BEHAVIORAL = 'behavioral',
  CUSTOM = 'custom',
}

export interface SegmentRule {
  field: string;
  operator: SegmentOperator;
  value: any;
}

export enum SegmentOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  IN = 'in',
  BETWEEN = 'between',
}