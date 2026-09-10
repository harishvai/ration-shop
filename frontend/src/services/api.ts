import { UserSession } from '../types';

const API_BASE = 'https://ration-shop-vm5f.onrender.com/api';

export function getAuthToken(): string | null {
  const session = localStorage.getItem('smart_ration_session');
  if (!session) return null;
  try {
    const parsed: UserSession = JSON.parse(session);
    return parsed.token || null;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public Demo & Health
  getHealth: () => request<{ status: string; shopsCount: number }>('/health'),
  getDemoData: () => request<{
    publicCards: Array<{ cardNumber: string; cardType: string; shopId: string; name: string }>;
    salesmen: Array<{ employeeId: string; shopId: string; name: string; shopName: string; password: string }>;
    head: { headId: string; password: string; designation: string };
  }>('/demo-data'),

  // Auth
  verifyPublicCard: (cardNumber: string) =>
    request<{ message: string; token: string; user: any }>('/auth/public/verify', {
      method: 'POST',
      body: JSON.stringify({ cardNumber }),
    }),

  loginSalesman: (credentials: { shopNumber: string; employeeId: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/salesman/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  loginHead: (credentials: { headId: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/head/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  // Public Portal
  getEntitlements: () => request<{ card: any; month: string; entitlements: any[] }>('/public/entitlements'),
  createOrder: (items: Array<{ itemId: number; quantity: number }>, paymentMethod: string) =>
    request<{ message: string; data: any }>('/public/orders', {
      method: 'POST',
      body: JSON.stringify({ items, paymentMethod }),
    }),
  getMyTokens: () => request<{ tokens: any[] }>('/public/tokens'),

  // Salesman Portal
  getSalesmanDashboard: () => request<{ shop: any; stats: any }>('/salesman/dashboard'),
  getSalesmanTokens: (params: { status?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return request<{ tokens: any[] }>(`/salesman/tokens?${query.toString()}`);
  },
  markDelivered: (tokenId: number, remarks?: string) =>
    request<{ message: string; delivery: any }>(`/salesman/tokens/${tokenId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
  getSalesmanStock: () => request<{ shopId: string; items: any[]; recentTransactions: any[] }>('/salesman/stock'),
  restockCommodity: (itemId: number, quantity: number, shipmentRef?: string) =>
    request<{ message: string; data: any }>('/salesman/stock/restock', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity, shipmentRef }),
    }),
  getSalesmanSales: () => request<{
    shopId: string;
    today: any;
    weekly: any;
    monthly: any;
    itemDistribution: any[];
    dailyTrend: any[];
  }>('/salesman/sales'),

  // Head Portal
  getHeadDashboard: () => request<{ metrics: any }>('/head/dashboard'),
  getAllShops: () => request<{ shops: any[] }>('/head/shops'),
  searchShop: (shopId: string) => request<any>(`/head/shops/${shopId}`),
  getHeadAnalytics: (timeRange?: string) =>
    request<{
      shopWiseSales: any[];
      stockMatrix: any[];
      itemDistribution: any[];
      orderStatuses: any[];
      timeline: any[];
    }>(`/head/analytics${timeRange ? `?timeRange=${timeRange}` : ''}`),
};
