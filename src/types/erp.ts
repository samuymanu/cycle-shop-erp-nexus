
export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: ProductCategory;
  type: ProductType;
  salePrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  serialNumber?: string; // For bicycles
  size?: string; // For bicycles and helmets
  brand: string;
  model: string;
  isActive: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  BICYCLES = 'bicycles',
  BICYCLE_PARTS = 'bicycle_parts',
  BICYCLE_ACCESSORIES = 'bicycle_accessories',
  MOTORCYCLE_PARTS = 'motorcycle_parts',
  MOTORCYCLE_HELMETS = 'motorcycle_helmets',
  MOTORCYCLE_ACCESSORIES = 'motorcycle_accessories',
}

export enum ProductType {
  BICYCLE_NEW = 'bicycle_new',
  PART = 'part',
  ACCESSORY = 'accessory',
  HELMET = 'helmet',
}

export interface Sale {
  id: string;
  clientId?: string;
  saleDate: Date;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  userId: string;
  items: SaleItem[];
  discount?: number;
  tax: number;
  subtotal: number;
  notes?: string;
  exchangeRate?: number; // For USD transactions
  totalUSD?: number; // Total in USD
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
}

export enum PaymentMethod {
  CASH_VES = 'cash_ves',
  CASH_USD = 'cash_usd',
  CARD = 'card',
  TRANSFER = 'transfer',
  CREDIT = 'credit',
  ZELLE = 'zelle',
  USDT = 'usdt',
}

export const PaymentMethodLabels = {
  [PaymentMethod.CASH_VES]: 'Efectivo en Bs',
  [PaymentMethod.CASH_USD]: 'Efectivo en $',
  [PaymentMethod.CARD]: 'Tarjeta',
  [PaymentMethod.TRANSFER]: 'Transferencia',
  [PaymentMethod.CREDIT]: 'Crédito',
  [PaymentMethod.ZELLE]: 'Zelle',
  [PaymentMethod.USDT]: 'USDT',
};

export enum SaleStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export interface Client {
  id: string;
  name: string;
  documentType: 'DNI' | 'RIF';
  documentNumber: string;
  address?: string;
  phone?: string;
  email?: string;
  balance: number; // For credit accounts
  isActive: boolean;
  createdAt: Date;
}

export interface ServiceOrder {
  id: string;
  clientId: string;
  bicycleId?: string;
  openDate: Date;
  closeDate?: Date;
  problemDescription: string;
  diagnosis?: string;
  status: ServiceStatus;
  technicianId: string;
  estimatedTotal?: number;
  finalTotal?: number;
  items: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  productId?: string; // For parts used
  serviceDescription: string;
  quantity: number;
  unitPrice: number;
}

export enum ServiceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WAITING_PARTS = 'waiting_parts',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
}

export interface DashboardStats {
  todaySales: number;
  monthSales: number;
  lowStockItems: number;
  activeServiceOrders: number;
  pendingPayments: number;
  topSellingProducts: Array<{
    product: Product;
    quantity: number;
  }>;
}

export interface ExchangeRates {
  bcv: number;
  parallel: number;
  lastUpdate: Date;
}
