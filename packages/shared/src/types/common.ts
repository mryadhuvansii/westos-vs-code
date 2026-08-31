/**
 * Common shared types
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SortParams {
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface FilterParams {
  search?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: any[];
  };
  request_id: string;
}

/**
 * Additional common types
 */

export interface Address {
  id?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'billing' | 'shipping';
}

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
  sizeBytes: number;
  storageKey: string;
  version: number;
  processingStatus: 'uploading' | 'processing' | 'ready' | 'failed' | 'archived';
  uploadedBy: string;
  uploadedAt: Date;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  MODEL_3D = 'model_3d',
}