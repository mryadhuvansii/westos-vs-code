import { api } from './api-core';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (variantId: string, quantity: number) => api.post('/cart/items', { variantId, quantity }),
  updateItem: (itemId: string, quantity: number) => api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

export const checkoutApi = {
  createSession: (cartId: string) => api.post('/checkout', { cartId }),
  getSession: (id: string) => api.get(`/checkout/${id}`),
  updateAddress: (id: string, data: { shippingAddressId: string; billingAddressId: string }) => api.patch(`/checkout/${id}/address`, data),
  selectShipping: (id: string, shippingMethodId: string) => api.patch(`/checkout/${id}/shipping`, { shippingMethodId }),
  initiatePayment: (id: string, data: { method: string; provider: string; returnUrl: string }) => api.post(`/checkout/${id}/payment`, data),
  complete: (id: string) => api.post(`/checkout/${id}/complete`),
};

export const ordersApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  createManualOrder: (data: any) => api.post('/orders', data),
  cancelOrder: (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
  requestReturn: (id: string, data: { items: { orderItemId: string; quantity: number; reason: string }[]; resolution: 'refund' | 'replacement' | 'store_credit' }) => api.post(`/orders/${id}/returns`, data),
  getReturns: (orderId: string) => api.get(`/orders/${id}/returns`),
  cancelReturn: (returnId: string) => api.delete(`/returns/${returnId}/cancel`),
};

export const paymentsApi = {
  getPayment: (id: string) => api.get(`/payments/${id}`),
  refund: (paymentId: string, amount: number, reason: string) => api.post(`/payments/${paymentId}/refund`, { amount, reason }),
};

export const searchApi = {
  search: (query: string, params?: { page?: number; limit?: number; category?: string; brand?: string; sort?: string }) => api.get('/search', { params: { q: query, ...params } }),
  autocomplete: (query: string) => api.get('/search/autocomplete', { params: { q: query } }),
  getFilters: () => api.get('/search/filters'),
};

export const reviewsApi = {
  getProductReviews: (productId: string, params?: { page?: number; limit?: number; rating?: number }) => api.get(`/products/${productId}/reviews`, { params }),
  createReview: (data: { productId: string; orderId: string; rating: number; title?: string; content: string }) => api.post('/reviews', data),
  vote: (reviewId: string, helpful: boolean) => api.post(`/reviews/${reviewId}/vote`, { helpful }),
};

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (variantId: string) => api.post('/wishlist', { variantId }),
  removeItem: (variantId: string) => api.delete(`/wishlist/${variantId}`),
};

export const buybackApi = {
  getEligibility: () => api.get('/buyback/eligibility'),
  initiate: (data: { serialCode: string; newOrderId: string }) => api.post('/buyback/initiate', data),
  getTransactions: () => api.get('/buyback/transactions'),
  getConfig: () => api.get('/buyback/config'),
};