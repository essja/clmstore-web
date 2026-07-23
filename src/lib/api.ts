import axios, { AxiosError, type AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: import('axios').InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clm_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: import('axios').AxiosResponse) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as typeof err.config & { _retry?: boolean };
    if (err.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('clm_refresh_token') : null;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem('clm_access_token', data.access_token);
          localStorage.setItem('clm_refresh_token', data.refresh_token);
          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return api(originalRequest!);
        } catch {
          localStorage.removeItem('clm_access_token');
          localStorage.removeItem('clm_refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    email: string; password: string; first_name: string; last_name: string;
    phone_number?: string; role?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) => api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
};

// ── Restaurants ───────────────────────────────────────────────────────────────
export const restaurantApi = {
  list: (params?: {
    q?: string; store_type?: string; cuisine_type?: string; sort_by?: string;
    is_featured?: boolean; page?: number; limit?: number;
    lat?: number; lon?: number; radius_km?: number;
  }) => api.get('/restaurants', { params }),

  getBySlug: (slug: string) => api.get(`/restaurants/${slug}`),

  getMenu: (restaurantId: number) => api.get(`/restaurants/${restaurantId}/menu`),

  getReviews: (restaurantId: number, page = 1) =>
    api.get(`/restaurants/${restaurantId}/reviews`, { params: { page, limit: 10 } }),

  getFeatured: () => api.get('/restaurants', { params: { is_featured: true, limit: 8 } }),

  getMyRestaurant: () => api.get('/restaurants/my'),

  updateMyRestaurant: (data: Record<string, unknown>) => api.patch('/restaurants/my', data),

  getCategories: (restaurantId: number) =>
    api.get(`/restaurants/${restaurantId}/categories`),

  createCategory: (restaurantId: number, data: { name: string; description?: string }) =>
    api.post(`/restaurants/${restaurantId}/categories`, data),

  deleteCategory: (restaurantId: number, categoryId: number) =>
    api.delete(`/restaurants/${restaurantId}/categories/${categoryId}`),

  updateCategory: (restaurantId: number, categoryId: number, data: Record<string, unknown>) =>
    api.patch(`/restaurants/${restaurantId}/categories/${categoryId}`, data),

  createMenuItem: (restaurantId: number, data: Record<string, unknown>) =>
    api.post(`/restaurants/${restaurantId}/menu`, data),

  updateMenuItem: (restaurantId: number, itemId: number, data: Record<string, unknown>) =>
    api.patch(`/restaurants/${restaurantId}/menu/${itemId}`, data),

  deleteMenuItem: (restaurantId: number, itemId: number) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),

  // Option Groups
  getOptionGroups: (restaurantId: number, itemId: number) =>
    api.get(`/restaurants/${restaurantId}/menu/${itemId}/option-groups`),

  createOptionGroup: (restaurantId: number, itemId: number, data: Record<string, unknown>) =>
    api.post(`/restaurants/${restaurantId}/menu/${itemId}/option-groups`, data),

  updateOptionGroup: (restaurantId: number, itemId: number, groupId: number, data: Record<string, unknown>) =>
    api.patch(`/restaurants/${restaurantId}/menu/${itemId}/option-groups/${groupId}`, data),

  deleteOptionGroup: (restaurantId: number, itemId: number, groupId: number) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}/option-groups/${groupId}`),

  addOption: (restaurantId: number, itemId: number, groupId: number, data: Record<string, unknown>) =>
    api.post(`/restaurants/${restaurantId}/menu/${itemId}/option-groups/${groupId}/options`, data),

  deleteOption: (restaurantId: number, itemId: number, groupId: number, optionId: number) =>
    api.delete(`/restaurants/${restaurantId}/menu/${itemId}/option-groups/${groupId}/options/${optionId}`),

  // Operating status
  setOperatingStatus: (status: 'open' | 'busy' | 'temporarily_closed') =>
    api.patch('/restaurants/my/operating-status', null, { params: { operating_status: status } }),

  // Opening hours
  getOpeningHours: (restaurantId: number) =>
    api.get(`/restaurants/${restaurantId}/opening-hours`),

  setOpeningHours: (restaurantId: number, hours: Array<{
    day_of_week: string; open_time?: string | null; close_time?: string | null; is_closed: boolean;
  }>) => api.put(`/restaurants/${restaurantId}/opening-hours`, hours),
};

// ── Cart ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),

  sync: (data: {
    restaurant_id: number;
    items: Array<{
      menu_item_id: number;
      quantity: number;
      customizations?: Array<{ group_id: number; group_name: string; option_id: number; option_name: string; price_modifier: number }>;
      special_instructions?: string;
    }>;
    coupon_code?: string;
  }) => api.post('/cart/sync', data),

  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  getSummary: (delivery_address_id: number) =>
    api.get('/cart/summary', { params: { delivery_address_id } }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data: {
    delivery_address_id: number;
    payment_method: string;
    notes?: string;
  }) => api.post('/orders', data),

  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),

  listForRestaurant: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders/restaurant', { params }),

  get: (orderId: number) => api.get(`/orders/${orderId}`),

  updateStatus: (orderId: number, status: string) =>
    api.patch(`/orders/${orderId}/status`, { status }),

  cancel: (orderId: number, reason: string) =>
    api.post(`/orders/${orderId}/cancel`, { reason }),

  review: (orderId: number, data: { rating: number; comment?: string }) =>
    api.post(`/orders/${orderId}/review`, data),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  initiate: (orderId: number, provider: string, details?: Record<string, unknown>) =>
    api.post('/payments/initiate', { order_id: orderId, provider, details }),

  verify: (paymentId: number, reference: string) =>
    api.post(`/payments/${paymentId}/verify`, { reference }),

  getInvoice: (orderId: number) => api.get(`/payments/orders/${orderId}/invoice`),

  getReceipt: (orderId: number) => api.get(`/payments/orders/${orderId}/receipt`),
};

// ── Location ──────────────────────────────────────────────────────────────────
export const locationApi = {
  geocode: (address: string, limit = 5) =>
    api.get('/location/geocode', { params: { address, limit } }),

  reverseGeocode: (lat: number, lon: number) =>
    api.get('/location/reverse-geocode', { params: { lat, lon } }),

  distance: (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ) => api.post('/location/distance', { origin, destination }),

  deliveryZones: () => api.get('/location/delivery-zones'),
};

// ── User ──────────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/users/me'),

  updateProfile: (data: Partial<{ first_name: string; last_name: string; phone_number: string }>) =>
    api.patch('/users/me', data),

  getAddresses: () => api.get('/users/me/addresses'),

  addAddress: (data: {
    label: string; address_line1: string; address_line2?: string;
    city?: string; latitude?: number; longitude?: number;
    is_default?: boolean; delivery_instructions?: string;
  }) => api.post('/users/me/addresses', data),

  updateAddress: (id: number, data: Record<string, unknown>) =>
    api.patch(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: number) => api.delete(`/users/me/addresses/${id}`),

  setDefaultAddress: (id: number) => api.patch(`/users/me/addresses/${id}/default`),

  getNotificationPrefs: () => api.get('/notifications/preferences'),

  updateNotificationPrefs: (prefs: Record<string, boolean>) =>
    api.patch('/notifications/preferences', prefs),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  list: (params?: { unread_only?: boolean; page?: number }) =>
    api.get('/notifications', { params }),

  markRead: (id: number) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.post('/notifications/mark-all-read'),

  registerDevice: (player_id: string) =>
    api.post('/notifications/device-token', null, { params: { player_id } }),
};

// ── File Uploads ──────────────────────────────────────────────────────────────
export const fileApi = {
  uploadImage: async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/files/images?folder=${encodeURIComponent(folder)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url as string;
  },
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  food: (q: string, params?: { restaurant_id?: number; page?: number; limit?: number }) =>
    api.get('/search/food', { params: { q, ...params } }),
};

// ── Coupons ───────────────────────────────────────────────────────────────────
export const couponApi = {
  validate: (data: { code: string; order_amount: number; restaurant_id?: number }) =>
    api.post('/coupons/validate', data),
};

// ── Dashboard (restaurant owner) ──────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/restaurants/my/stats'),

  getEarnings: (params?: { page?: number; limit?: number }) =>
    api.get('/restaurants/my/earnings', { params }),

  getEarningsSummary: () => api.get('/restaurants/my/earnings/summary'),

  getWithdrawals: (params?: { page?: number; limit?: number }) =>
    api.get('/restaurants/my/withdrawals', { params }),

  requestWithdrawal: (data: { amount: number; payment_method: string; payment_details: string }) =>
    api.post('/restaurants/my/withdrawal', data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/dashboard'),

  getOrders: (params?: Record<string, unknown>) =>
    api.get('/admin/orders', { params }),

  getUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),

  suspendUser: (userId: number, reason: string) =>
    api.post(`/admin/users/${userId}/suspend`, null, { params: { reason } }),

  activateUser: (userId: number) =>
    api.post(`/admin/users/${userId}/activate`),

  getRestaurants: (params?: Record<string, unknown>) =>
    api.get('/admin/restaurants', { params }),

  approveRestaurant: (id: number) =>
    api.post(`/admin/restaurants/${id}/approve`),

  rejectRestaurant: (id: number, reason: string) =>
    api.post(`/admin/restaurants/${id}/reject`, null, { params: { reason } }),

  getDisputes: (params?: { status?: string; limit?: number; page?: number }) =>
    api.get('/admin/disputes', { params }),

  resolveDispute: (id: number, data: { resolution: string; refund_payment: boolean }) =>
    api.post(`/admin/disputes/${id}/resolve`, data),

  getCoupons: (params?: Record<string, unknown>) =>
    api.get('/coupons', { params }),

  createCoupon: (data: Record<string, unknown>) =>
    api.post('/coupons', data),

  deleteCoupon: (id: number) =>
    api.delete(`/coupons/${id}`),

  getAnalytics: (period = 'month') =>
    api.get('/admin/dashboard', { params: { period } }),

  getRiderWithdrawals: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/riders/withdrawals', { params }),

  approveRiderWithdrawal: (id: number, transaction_reference?: string) =>
    api.post(`/admin/riders/withdrawals/${id}/approve`, null, { params: { transaction_reference } }),

  rejectRiderWithdrawal: (id: number, reason: string) =>
    api.post(`/admin/riders/withdrawals/${id}/reject`, null, { params: { reason } }),

  getRestaurantWithdrawals: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/admin/restaurants/withdrawals', { params }),

  approveRestaurantWithdrawal: (id: number, transaction_reference?: string) =>
    api.post(`/admin/restaurants/withdrawals/${id}/approve`, null, { params: { transaction_reference } }),

  rejectRestaurantWithdrawal: (id: number, reason: string) =>
    api.post(`/admin/restaurants/withdrawals/${id}/reject`, null, { params: { reason } }),
};

// ── Rider ─────────────────────────────────────────────────────────────────────
export const riderApi = {
  getProfile: () => api.get('/riders/profile'),

  updateAvailability: (is_available: boolean) =>
    api.patch('/riders/availability', null, { params: { is_available } }),

  getActiveDeliveries: () => api.get('/deliveries/my-active'),

  getAvailableOrders: () => api.get('/deliveries/available'),

  acceptDelivery: (orderId: number) =>
    api.post(`/deliveries/orders/${orderId}/accept`),

  getEarnings: (params?: { page?: number; limit?: number }) =>
    api.get('/riders/earnings', { params }),

  getEarningsSummary: () => api.get('/riders/earnings/summary'),

  getWithdrawals: (params?: { page?: number; limit?: number }) =>
    api.get('/riders/withdrawals', { params }),

  requestWithdrawal: (data: { amount: number; payment_method: string; payment_details: string }) =>
    api.post('/riders/withdrawals', data),
};

export default api;
