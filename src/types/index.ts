export interface Service {
  id: number;
  title: string;
  title_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  price_dt: number;
  old_price_dt?: number;
  category: string;
  delivery_time: string;
  features: string[];
  image_url: string;
  is_popular?: boolean;
  is_active: boolean;
}

export interface PricePlan {
  id: number;
  plan_name: string;
  plan_name_ar: string;
  price_dt: number;
  old_price_dt?: number;
  billing_cycle: string;
  badge?: string;
  category?: 'kick' | 'web' | 'app' | 'combo' | 'starter' | string;
  description: string;
  features: string[];
  is_featured: boolean;
}

export type OrderStatus = 'en_attente' | 'en_cours' | 'validee' | 'livree' | 'annulee';
export type PaymentStatus = 'non_paye' | 'acompte_recu' | 'paye';

export interface Order {
  id: number;
  order_code: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  service_id?: number;
  service_title: string;
  price_dt: number;
  discount_dt: number;
  total_dt: number;
  details: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  promo_code_used?: string;
  created_at: string;
}

export interface Client {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  city: string;
  company_name?: string;
  total_orders: number;
  total_spent_dt: number;
  created_at: string;
  last_order_at?: string;
}

export interface Message {
  id: number;
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  client_name: string;
  category: 'video' | 'sponsoring' | 'logo' | 'affiche' | 'web' | 'app';
  description: string;
  media_url: string;
  results_metric?: string;
  is_featured: boolean;
}

export interface Promotion {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed_dt';
  discount_value: number;
  min_order_dt: number;
  valid_until: string;
  is_active: boolean;
}

// ----------------------------------------------------
// NEW: ADS MANAGEMENT & APPROVAL SYSTEM TYPES
// ----------------------------------------------------
export type AdApprovalStatus = 'pending' | 'accepted' | 'rejected';

export interface AdCustomElement {
  id: string;
  type: 'text' | 'badge' | 'link' | 'highlight';
  label: string;
  value: string;
}

export interface AdItem {
  id: number;
  title: string;
  title_ar?: string;
  slug: string;
  advertiser_name: string;
  advertiser_phone: string;
  advertiser_email?: string;
  description: string;
  description_ar?: string;
  price_dt: number;
  old_price_dt?: number;
  category: string;
  images: string[];
  video_url?: string;
  status: AdApprovalStatus; // pending, accepted, rejected
  rejection_reason?: string;
  is_published: boolean;
  is_paused: boolean;
  start_date: string;
  end_date: string;
  scheduled_publish_time?: string;
  custom_elements?: AdCustomElement[];
  latitude?: number;
  longitude?: number;
  map_address?: string;
  map_enabled?: boolean;
  views_count?: number;
  clicks_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface NotificationItem {
  id: number;
  recipient_phone?: string;
  recipient_name?: string;
  title: string;
  message: string;
  type: 'ad_status' | 'order' | 'system' | 'message';
  ad_id?: number;
  order_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface WorkingDay {
  day: string;
  day_ar: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface WorkingHoursConfig {
  timezone: string;
  schedule_note: string;
  schedule_note_ar: string;
  days: WorkingDay[];
  ramadan_hours?: string;
  emergency_support_247: boolean;
}

export interface ContentBlock {
  id: string;
  section_key: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  badge?: string;
  order_index: number;
  is_visible: boolean;
  media_url?: string;
}

export interface Settings {
  agency_name: string;
  tagline: string;
  sub_tagline: string;
  hero_description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebook_url: string;
  instagram_url?: string;
  website_url: string;
  currency: string;
  announcement_active: boolean;
  announcement_text: string;
  default_latitude?: number;
  default_longitude?: number;
  payment_terms?: string;
  payment_terms_ar?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  email: string;
  last_password_change?: string;
}

export interface AppData {
  settings: Settings;
  services: Service[];
  prices: PricePlan[];
  orders: Order[];
  clients: Client[];
  messages: Message[];
  portfolio: PortfolioItem[];
  promotions: Promotion[];
  admins: AdminUser[];
  ads: AdItem[];
  notifications: NotificationItem[];
  working_hours: WorkingHoursConfig;
  content_blocks: ContentBlock[];
}
