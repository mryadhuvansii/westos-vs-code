/**
 * Notification types
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  status: NotificationStatus;
  sentAt?: Date;
  providerMessageId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED = 'payment_failed',
  RETURN_INITIATED = 'return_initiated',
  RETURN_APPROVED = 'return_approved',
  REFUND_PROCESSED = 'refund_processed',
  BUYBACK_ELIGIBLE = 'buyback_eligible',
  BUYBACK_VERIFIED = 'buyback_verified',
  SECURITY_ALERT = 'security_alert',
  MARKETING = 'marketing',
  PRICE_DROP = 'price_drop',
  BACK_IN_STOCK = 'back_in_stock',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export interface NotificationTemplate {
  id: string;
  key: string;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables: string[];
}