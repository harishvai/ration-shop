export type UserRole = 'PUBLIC' | 'SALESMAN' | 'HEAD';

export interface UserSession {
  role: UserRole;
  token: string;
  username?: string;
  fullName?: string;
  // Public specific
  cardNumber?: string;
  cardType?: string;
  phone?: string;
  address?: string;
  familyMembersCount?: number;
  // Salesman specific
  employeeId?: string;
  designation?: string;
  // Head specific
  headId?: string;
  department?: string;
  // Shop details
  shop?: {
    shopId: string;
    shopName: string;
    location: string;
    district?: string;
    pincode?: string;
  };
}

export interface EntitlementItem {
  entitlementId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  subsidizedPrice: number;
  marketPrice: number;
  imageIcon: string;
  allocatedQty: number;
  claimedQty: number;
  remainingQty: number;
  shopStock: number;
}

export interface CartItem {
  itemId: number;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  marketPrice: number;
  remainingAllowed: number;
}

export interface OrderItem {
  itemId?: number;
  itemName?: string;
  name?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  icon?: string;
}

export interface TokenRecord {
  tokenId: number;
  tokenNumber: string;
  tokenStatus: 'READY' | 'DELIVERED' | 'EXPIRED';
  orderId?: number;
  orderNumber?: string;
  orderStatus: 'PENDING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  customerName?: string;
  customerPhone?: string;
  cardNumber?: string;
  cardType?: string;
  shopId?: string;
  shopName?: string;
  shopLocation?: string;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'PAY_AT_SHOP';
  paymentStatus: string;
  transactionRef?: string;
  generatedAt: string;
  deliveredAt?: string;
  deliveredBy?: string;
  remarks?: string;
  itemsSummary?: string;
  items?: OrderItem[];
}

export interface StockItem {
  inventoryId: number;
  shopId: string;
  itemId: number;
  itemCode: string;
  itemName: string;
  unit: string;
  subsidizedPrice: number;
  marketPrice: number;
  imageIcon?: string;
  openingStock: number;
  receivedStock: number;
  distributedStock: number;
  currentStock: number;
  minThreshold: number;
  isLowStock: boolean;
  lastUpdated: string;
}

export interface StockTransaction {
  id: number;
  type: string;
  itemName: string;
  unit: string;
  quantity: number;
  balanceAfter: number;
  reference?: string;
  employeeId?: string;
  timestamp: string;
}

export interface ShopSummary {
  shopId: string;
  shopName: string;
  location: string;
  district: string;
  pincode: string;
  phone?: string;
  status: string;
  salesman: {
    employeeId: string;
    name: string;
    phone?: string;
  };
  currentStockKg: number;
  hasLowStock: boolean;
  lowStockItemsCount: number;
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
  deliveredOrders: number;
}
