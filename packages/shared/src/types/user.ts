/**
 * User and authentication types
 */

export interface User {
  id: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  PENDING_VERIFICATION = 'pending_verification',
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  warehouseScope?: string[];
  isSuperAdmin: boolean;
  status: AdminUserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdminUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}