export interface MealItem {

  id: string;

  meal_id: string;

  name: string;

  is_veg: boolean;

  sort_order: number;

  created_at: string;

}


 

export interface Meal {

  id: string;

  meal_date: string;

  meal_slot: 'lunch' | 'dinner';

  name: string;

  description: string | null;

  image_url: string | null;

  tags: string[] | null;

  is_veg: boolean;

  price: number;

  is_available: boolean;

  created_by: string | null;

  created_at: string;

  meal_items?: MealItem[];

}


 

export interface Profile {

  id: string;

  email: string;

  full_name: string | null;

  role: 'customer' | 'admin' | 'kitchen' | 'driver';

  phone: string | null;

  address_line1: string | null;

  address_line2: string | null;

  city: string | null;

  state: string | null;

  pincode: string | null;

  created_at: string;

}


 

export interface SubscriptionPlan {

  id: 'plan_lunch' | 'plan_dinner' | 'plan_both';

  name: string;

  meals_per_day: 1 | 2;

  price_monthly: number;

  description: string;

}


 

export interface Subscription {

  id: string;

  customer_id: string;

  plan_id: 'plan_lunch' | 'plan_dinner' | 'plan_both';

  status: 'pending' | 'active' | 'canceled';

  diet_type: 'veg' | 'non-veg' | 'both';

  meal_slot_preference: 'lunch' | 'dinner' | 'both';

  notes: string | null;

  current_period_start: string;

  current_period_end: string;

  created_at: string;

}


 

export interface MenuCategory {

  id: string;

  name: string;

  description: string | null;

  image_url: string | null;

  sort_order: number;

  is_active: boolean;

  created_at: string;

}


 

export interface MenuItem {

  id: string;

  category_id: string;

  name: string;

  description: string | null;

  price: number;

  is_veg: boolean;

  is_active: boolean;

  image_url: string | null;

  sort_order: number;

  created_at: string;

  category?: MenuCategory;

}


 

export interface OrderItem {

  id: string;

  order_id: string;

  menu_item_id: string | null;

  meal_id: string | null;

  quantity: number;

  unit_price: number;

  subtotal: number;

  created_at: string;

  menu_item?: Pick<MenuItem, 'id' | 'name'>;

  meal?: Pick<Meal, 'id' | 'name' | 'meal_slot'>;

}


 

export interface Order {

  id: string;

  customer_id: string;

  meal_date: string;

  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'canceled';

  driver_id: string | null;

  delivery_address_id: string | null;

  coupon_id: string | null;

  subtotal: number;

  discount_amount: number;

  final_amount: number;

  notes: string | null;

  created_at: string;

  order_items?: OrderItem[];

  driver?: Pick<Driver, 'id' | 'name' | 'phone'>;

}


 

export interface Driver {

  id: string;

  name: string;

  phone: string;

  email: string | null;

  vehicle: string | null;

  is_active: boolean;

  profile_id: string | null;

  created_at: string;

}


 

export interface Address {

  id: string;

  customer_id: string;

  label: string;

  address_line1: string;

  address_line2: string | null;

  city: string;

  state: string;

  pincode: string;

  is_default: boolean;

  lat: number | null;

  lng: number | null;

  created_at: string;

}


 

export interface Coupon {

  id: string;

  code: string;

  type: 'percentage' | 'fixed' | 'free_delivery' | 'first_order';

  value: number | null;

  min_order_value: number | null;

  max_uses: number | null;

  used_count: number;

  valid_from: string | null;

  valid_until: string | null;

  is_active: boolean;

  description: string | null;

  created_at: string;

}


 

export interface ContactSubmission {

  id: string;

  name: string;

  email: string;

  phone: string | null;

  message: string;

  is_read: boolean;

  created_at: string;

}