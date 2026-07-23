// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'restaurant_owner' | 'rider' | 'admin' | 'super_admin';

export interface User {
  id: number;
  email: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  profile_picture?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  onesignal_player_id?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
}

// ── Restaurant ────────────────────────────────────────────────────────────────
export type StoreType = 'restaurant' | 'grocery' | 'pharmacy';
export type RestaurantStatus = 'pending' | 'verified' | 'suspended' | 'rejected' | 'closed';
export type OperatingStatus = 'open' | 'busy' | 'temporarily_closed';

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  cuisine_type?: string;
  store_type: StoreType;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  delivery_fee: number;
  min_order_amount: number;
  avg_rating: number;
  total_reviews: number;
  is_open: boolean;
  operating_status: OperatingStatus;
  is_featured: boolean;
  status: RestaurantStatus;
  estimated_delivery_time?: number;
  owner_id: number;
  created_at: string;
}

// ── Menu ─────────────────────────────────────────────────────────────────────
export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  restaurant_id: number;
  items: MenuItem[];
}

export interface MenuOption {
  id: number;
  option_group_id: number;
  name: string;
  price_modifier: number;
  is_default: boolean;
  is_available: boolean;
  display_order: number;
}

export interface MenuOptionGroup {
  id: number;
  menu_item_id: number;
  name: string;
  group_type: 'single' | 'multiple' | 'removal';
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  effective_price: number;
  image?: string;
  is_available: boolean;
  is_popular?: boolean;
  is_recommended?: boolean;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  discount_percentage?: number;
  category_id: number;
  restaurant_id: number;
  preparation_time_min?: number;
  calories?: number;
  option_groups: MenuOptionGroup[];
}

// ── Cart (local state) ────────────────────────────────────────────────────────
export interface CartCustomization {
  group_id: number;
  group_name: string;
  option_id: number;
  option_name: string;
  price_modifier: number;
}

export interface CartItem {
  cart_key: string; // unique key: `${menu_item_id}-${customization_hash}`
  menu_item_id: number;
  name: string;
  price: number; // base price
  quantity: number;
  image?: string;
  customizations?: CartCustomization[]; // optional for backwards compat with old persisted carts
  special_instructions?: string;
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal_amount: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  payment_provider?: string;
  special_instructions?: string;
  items: OrderItem[];
  restaurant?: Restaurant;
  customer?: User;
  delivery?: Delivery & { rider?: User };
  delivery_address?: UserAddress & Record<string, unknown>;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentProvider = 'cash' | 'orange_money' | 'afrimoney' | 'stripe';

export interface PaymentInitResponse {
  payment_id: number;
  status: string;
  provider_ref?: string;
  redirect_url?: string;
  client_secret?: string;
  message: string;
}

// ── Delivery ──────────────────────────────────────────────────────────────────
export type DeliveryStatus =
  | 'pending' | 'assigned' | 'accepted' | 'picking_up'
  | 'picked_up' | 'out_for_delivery' | 'delivered' | 'failed';

export interface Delivery {
  id: number;
  order_id: number;
  rider_id?: number;
  status: DeliveryStatus;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  distance_km?: number;
  estimated_duration_min?: number;
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
}

// ── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

// ── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: number;
  order_id: number;
  restaurant_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

// ── User Address ──────────────────────────────────────────────────────────────
export interface UserAddress {
  id: number;
  label: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  delivery_instructions?: string;
}

// ── Opening Hours ─────────────────────────────────────────────────────────────
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHours {
  id: number;
  restaurant_id: number;
  day_of_week: DayOfWeek;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  today_revenue: number;
  today_orders: number;
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_restaurants: number;
  pending_orders: number;
  active_riders: number;
  avg_rating: number;
}

// ── Rider ─────────────────────────────────────────────────────────────────────
export interface RiderProfile {
  id: number;
  user_id: number;
  vehicle_type: string;
  vehicle_plate?: string;
  is_verified: boolean;
  is_available: boolean;
  total_deliveries: number;
  total_earnings: number;
  current_balance: number;
  avg_rating: number;
}

// ── API Pagination ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Location ──────────────────────────────────────────────────────────────────
export interface GeocodingResult {
  display_name: string;
  latitude: number;
  longitude: number;
  address_details?: Record<string, string>;
}

// ── Coupon ────────────────────────────────────────────────────────────────────
export interface CouponValidateResponse {
  valid: boolean;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  max_discount?: number;
}
