import { api } from './api-core';

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  sendOtp: (contact: string, channel: 'email' | 'sms' | 'whatsapp') => api.post('/auth/otp/send', { contact, channel }),
  verifyOtp: (contact: string, code: string, channel: 'email' | 'sms' | 'whatsapp') => api.post('/auth/otp/verify', { contact, code, channel }),
  enable2fa: () => api.post('/auth/2fa/enable'),
  disable2fa: (code: string) => api.post('/auth/2fa/disable', { code }),
};

export const customersApi = {
  getProfile: () => api.get('/customers/me'),
  updateProfile: (data: Partial<{ firstName: string; lastName: string; dateOfBirth: string; gender: string; marketingConsent: boolean }>) => api.patch('/customers/me', data),
  getAddresses: () => api.get('/customers/me/addresses'),
  createAddress: (data: { type: 'billing' | 'shipping'; name: string; phone: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; isDefault?: boolean }) => api.post('/customers/me/addresses', data),
  updateAddress: (id: string, data: Partial<{ type: 'billing' | 'shipping'; name: string; phone: string; line1: string; line2?: string; city: string; state: string; postalCode: string; country: string; isDefault: boolean }>) => api.patch(`/customers/me/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/customers/me/addresses/${id}`),
  getPreferences: () => api.get('/customers/me/preferences'),
  updatePreferences: (data: { emailNotifications: boolean; smsNotifications: boolean; whatsappNotifications: boolean; marketingConsent: boolean; orderUpdates: boolean; promotionalUpdates: boolean }) => api.patch('/customers/me/preferences', data),
  getDevices: () => api.get('/customers/me/devices'),
  removeDevice: (deviceId: string) => api.delete(`/customers/me/devices/${deviceId}`),
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => api.get('/customers/me/orders', { params }),
  getOrder: (id: string) => api.get(`/customers/me/orders/${id}`),
  getWishlist: () => api.get('/customers/me/wishlist'),
  addToWishlist: (variantId: string) => api.post('/customers/me/wishlist', { variantId }),
  removeFromWishlist: (variantId: string) => api.delete(`/customers/me/wishlist/${variantId}`),
  getReviews: () => api.get('/customers/me/reviews'),
  createReview: (data: { productId: string; orderId: string; rating: number; title?: string; content: string }) => api.post('/customers/me/reviews', data),
  getBuybackEligibility: () => api.get('/buyback/eligibility'),
  initiateBuyback: (data: { serialCode: string; newOrderId: string }) => api.post('/buyback/initiate', data),
};

export const catalogueApi = {
  getProducts: (params?: { page?: number; limit?: number; category?: string; brand?: string; collection?: string; sort?: string; order?: 'asc' | 'desc'; minPrice?: number; maxPrice?: number; search?: string }) => api.get('/products', { params }),
  getProduct: (slug: string) => api.get(`/products/${slug}`),
  getProductVariants: (productId: string) => api.get(`/products/${productId}/variants`),
  getProductMedia: (productId: string) => api.get(`/products/${productId}/media`),
  getCategories: () => api.get('/categories'),
  getCategory: (slug: string) => api.get(`/categories/${slug}`),
  getBrands: () => api.get('/brands'),
  getBrand: (slug: string) => api.get(`/brands/${slug}`),
  getCollections: () => api.get('/collections'),
  getCollection: (slug: string) => api.get(`/collections/${slug}`),
  getCollectionProducts: (collectionId: string, params?: { page?: number; limit?: number }) => api.get(`/collections/${collectionId}/products`, { params }),
};