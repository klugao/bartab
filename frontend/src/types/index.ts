export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  balance_due: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  price: string;
  active: boolean;
}

export enum TabStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface Tab {
  id: string;
  customer?: Customer;
  status: TabStatus;
  opened_at: string;
  closed_at?: string;
  tabItems: TabItem[];
  payments: Payment[];
}

export interface TabItem {
  id: string;
  tab: Tab;
  item: Item;
  qty: number;
  unit_price: string;
  total: string;
  created_at: string;
  updated_at: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
  LATER = 'LATER'
}

export interface Payment {
  id: string;
  tab: Tab;
  method: PaymentMethod;
  amount: string;
  paid_at: string;
  note?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
}

export interface CreateItemDto {
  name: string;
  price: number;
}

export interface CreateTabDto {
  customerId?: string;
}

export interface UpdateTabDto {
  customerId?: string | null;
}

export interface AddItemDto {
  itemId: string;
  qty: number;
  unitPrice?: string;
}

export interface AddPaymentDto {
  method: PaymentMethod;
  amount: string;
  note?: string;
}

export interface Establishment {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  pix_qr_code?: string;
  active: boolean;
  statusAprovacao: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateEstablishmentDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  pix_qr_code?: string;
}
