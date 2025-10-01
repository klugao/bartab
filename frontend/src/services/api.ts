import axios from 'axios';
import type { 
  Customer, 
  Item, 
  Tab, 
  TabItem, 
  Payment,
  CreateCustomerDto,
  CreateItemDto,
  CreateTabDto,
  AddItemDto,
  AddPaymentDto
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT (quando implementar autenticação)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Customers API
export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers').then(res => res.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then(res => res.data),
  create: (data: CreateCustomerDto) => api.post<Customer>('/customers', data).then(res => res.data),
  update: (id: string, data: Partial<CreateCustomerDto>) => api.patch<Customer>(`/customers/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Items API
export const itemsApi = {
  getAll: () => api.get<Item[]>('/items').then(res => res.data),
  getActive: () => api.get<Item[]>('/items/active').then(res => res.data),
  getById: (id: string) => api.get<Item>(`/items/${id}`).then(res => res.data),
  create: (data: CreateItemDto) => api.post<Item>('/items', data).then(res => res.data),
  update: (id: string, data: Partial<CreateItemDto>) => api.patch<Item>(`/items/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/items/${id}`),
  deactivate: (id: string) => api.patch<Item>(`/items/${id}/deactivate`).then(res => res.data),
};

// Tabs API
export const tabsApi = {
  open: (data: CreateTabDto) => {
    console.log('tabsApi.open - dados enviados:', JSON.stringify(data, null, 2));
    return api.post<Tab>('/tabs', data).then(res => {
      console.log('tabsApi.open - resposta recebida:', JSON.stringify(res.data, null, 2));
      return res.data;
    });
  },
  getOpen: () => api.get<Tab[]>('/tabs').then(res => res.data),
  // Removendo getClosed temporariamente até implementar no backend
  // getClosed: () => api.get<Tab[]>('/tabs/closed').then(res => res.data),
  getById: (id: string) => {
    console.log('tabsApi.getById - Buscando conta:', id);
    return api.get<Tab>(`/tabs/${id}`).then(res => res.data);
  },
  addItem: (tabId: string, data: AddItemDto) => {
    console.log('tabsApi.addItem - Usando endpoint que funciona:', { tabId, ...data });
    return api.post<TabItem>('/tabs/add-item', { tabId, ...data }).then(res => res.data);
  },
  removeItem: (tabId: string, tabItemId: string) => {
    console.log('tabsApi.removeItem - Usando endpoint que funciona:', { tabId, tabItemId });
    return api.post('/tabs/remove-item', { tabId, tabItemId });
  },
  addPayment: (tabId: string, data: AddPaymentDto) => {
    console.log('tabsApi.addPayment - Enviando pagamento:', { tabId, ...data });
    return api.post<Payment>('/tabs/add-payment', { tabId, ...data }).then(res => res.data);
  },
  close: (id: string) => api.patch<Tab>(`/tabs/${id}/close`).then(res => res.data),
  delete: (id: string) => {
    console.log('tabsApi.delete - Usando endpoint que funciona:', id);
    return api.post('/tabs/delete-tab', { tabId: id });
  },
};

export default api;
