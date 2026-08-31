/**
 * Product and catalogue types
 */

import { Inventory } from './inventory';

export interface Product {
  id: string;
  articleCode: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  brand?: Brand;
  categoryId: string;
  category?: Category;
  fit: string;
  fabricId?: string;
  fabric?: Fabric;
  status: ProductStatus;
  variants: ProductVariant[];
  media: ProductMedia[];
  attributes: ProductAttribute[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  ARCHIVED = 'archived',
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  weight?: number;
  barcode?: string;
  status: VariantStatus;
  inventory?: Inventory;
  createdAt: Date;
  updatedAt: Date;
}

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  image?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
}

export interface Fabric {
  id: string;
  name: string;
  composition?: string;
  stretch?: string;
  weight?: string;
  feel?: string;
  careInstructions?: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  variantId?: string;
  type: import('./common').MediaType;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  processingStatus: MediaProcessingStatus;
}

export enum MediaProcessingStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export interface ProductAttribute {
  id: string;
  productId: string;
  key: string;
  value: string;
  displayOrder: number;
}