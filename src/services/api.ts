import {
  AppData,
  Order,
  Service,
  PricePlan,
  PortfolioItem,
  Promotion,
  Settings,
  Message,
  Client,
  AdItem,
  AdApprovalStatus,
  NotificationItem,
  WorkingHoursConfig,
  ContentBlock,
} from '../types';

export const api = {
  // Fetch initial state
  async getData(): Promise<AppData> {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Erreur lors du chargement des données');
    const json = await res.json();
    return json.data;
  },

  // Admin login
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; admin?: any; message?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  // Change password
  async changePassword(old_password: string, new_password: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password, new_password })
    });
    return res.json();
  },

  // Logout all sessions
  async logoutAll(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/logout-all', { method: 'POST' });
    return res.json();
  },

  // ==========================================
  // ADS MANAGEMENT & APPROVAL SYSTEM
  // ==========================================
  async getAds(): Promise<{ success: boolean; ads: AdItem[] }> {
    const res = await fetch('/api/ads');
    return res.json();
  },

  async createAd(data: Partial<AdItem>): Promise<{ success: boolean; message: string; ad: AdItem }> {
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAd(id: number, data: Partial<AdItem>): Promise<{ success: boolean; ad: AdItem }> {
    const res = await fetch(`/api/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAd(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async updateAdStatus(id: number, status: AdApprovalStatus, rejection_reason?: string): Promise<{ success: boolean; message: string; ad: AdItem }> {
    const res = await fetch(`/api/ads/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejection_reason })
    });
    return res.json();
  },

  async toggleAdPublish(id: number): Promise<{ success: boolean; message: string; is_published: boolean }> {
    const res = await fetch(`/api/ads/${id}/toggle-publish`, { method: 'PUT' });
    return res.json();
  },

  async toggleAdPause(id: number): Promise<{ success: boolean; message: string; is_paused: boolean }> {
    const res = await fetch(`/api/ads/${id}/toggle-pause`, { method: 'PUT' });
    return res.json();
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(): Promise<{ success: boolean; notifications: NotificationItem[] }> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async createNotification(data: Partial<NotificationItem>): Promise<{ success: boolean; notification: NotificationItem }> {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async markNotificationRead(id: number): Promise<{ success: boolean; notification: NotificationItem }> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async deleteNotification(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // WORKING HOURS & SCHEDULE
  // ==========================================
  async getWorkingHours(): Promise<{ success: boolean; working_hours: WorkingHoursConfig }> {
    const res = await fetch('/api/working-hours');
    return res.json();
  },

  async updateWorkingHours(data: Partial<WorkingHoursConfig>): Promise<{ success: boolean; message: string; working_hours: WorkingHoursConfig }> {
    const res = await fetch('/api/working-hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ==========================================
  // CONTENT BLOCKS (CMS)
  // ==========================================
  async getContentBlocks(): Promise<{ success: boolean; content_blocks: ContentBlock[] }> {
    const res = await fetch('/api/content-blocks');
    return res.json();
  },

  async createContentBlock(data: Partial<ContentBlock>): Promise<{ success: boolean; block: ContentBlock }> {
    const res = await fetch('/api/content-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateContentBlock(id: string, data: Partial<ContentBlock>): Promise<{ success: boolean; block: ContentBlock }> {
    const res = await fetch(`/api/content-blocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteContentBlock(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/content-blocks/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async createOrder(data: {
    client_name: string;
    client_phone: string;
    client_email?: string;
    service_id?: number;
    service_title: string;
    price_dt: number;
    details: string;
    promo_code?: string;
  }): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateOrderStatus(id: number, status: string, payment_status?: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, payment_status })
    });
    return res.json();
  },

  async deleteOrder(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // SERVICES
  // ==========================================
  async createService(data: Partial<Service>): Promise<{ success: boolean; service: Service }> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateService(id: number, data: Partial<Service>): Promise<{ success: boolean; service: Service }> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteService(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // PRICES
  // ==========================================
  async createPrice(data: Partial<PricePlan>): Promise<{ success: boolean; price: PricePlan }> {
    const res = await fetch('/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updatePrice(id: number, data: Partial<PricePlan>): Promise<{ success: boolean; price: PricePlan }> {
    const res = await fetch(`/api/prices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletePrice(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/prices/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // CLIENTS
  // ==========================================
  async updateClient(id: number, data: Partial<Client>): Promise<{ success: boolean; client: Client }> {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteClient(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // MESSAGES
  // ==========================================
  async sendMessage(data: { sender_name: string; sender_phone: string; sender_email?: string; subject?: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteMessage(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // PORTFOLIO
  // ==========================================
  async createPortfolioItem(data: Partial<PortfolioItem>): Promise<{ success: boolean; item: PortfolioItem }> {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updatePortfolioItem(id: number, data: Partial<PortfolioItem>): Promise<{ success: boolean; item: PortfolioItem }> {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletePortfolioItem(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // PROMOTIONS
  // ==========================================
  async createPromotion(data: Partial<Promotion>): Promise<{ success: boolean; promo: Promotion }> {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updatePromotion(id: number, data: Partial<Promotion>): Promise<{ success: boolean; promo: Promotion }> {
    const res = await fetch(`/api/promotions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deletePromotion(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  async updateSettings(data: Partial<Settings>): Promise<{ success: boolean; settings: Settings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
