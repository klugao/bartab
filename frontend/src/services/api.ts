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
  UpdateTabDto,
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

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Customers API
export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers').then(res => res.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then(res => res.data),
  create: (data: CreateCustomerDto) => api.post<Customer>('/customers', data).then(res => res.data),
  update: (id: string, data: Partial<CreateCustomerDto>) => api.patch<Customer>(`/customers/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  getCustomersWithDebts: () => api.get<Customer[]>('/customers/debts/list').then(res => res.data),
  payDebt: (id: string, data: { amount: string; method: string; note?: string }) => {
    console.log('customersApi.payDebt - Dados enviados:', { id, ...data });
    return api.post<Customer>(`/customers/${id}/pay-debt`, data).then(res => res.data);
  },
};

// Items API
export const itemsApi = {
  getAll: () => api.get<Item[]>('/items').then(res => res.data),
  getActive: () => api.get<Item[]>('/items/active').then(res => res.data),
  getActiveBestSellers: () => api.get<Item[]>('/items/active/best-sellers').then(res => res.data),
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
  getClosed: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return api.get<Tab[]>(`/tabs/closed${queryString ? `?${queryString}` : ''}`).then(res => res.data);
  },
  getById: (id: string) => {
    console.log('tabsApi.getById - Buscando conta:', id);
    return api.get<Tab>(`/tabs/${id}`).then(res => res.data);
  },
  update: (id: string, data: UpdateTabDto) => {
    console.log('tabsApi.update - Atualizando conta:', { id, ...data });
    return api.patch<Tab>(`/tabs/${id}`, data).then(res => res.data);
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
  getConsumptionReport: (year: number, month: number) => {
    console.log('tabsApi.getConsumptionReport - Buscando relatório:', { year, month });
    return api.get(`/tabs/reports/consumption?year=${year}&month=${month}`).then(res => res.data);
  },
  getAvailableMonths: () => {
    console.log('tabsApi.getAvailableMonths - Buscando meses disponíveis');
    return api.get<Array<{ year: number; month: number; value: string }>>('/tabs/reports/available-months').then(res => res.data);
  },
};

// Expenses API
export const expensesApi = {
  create: (data: { description: string; amount: string; year: number; month: number }) => {
    console.log('expensesApi.create - Dados enviados:', data);
    return api.post('/expenses', data).then(res => res.data);
  },
  getByPeriod: (year: number, month: number) => {
    console.log('expensesApi.getByPeriod - Buscando despesas:', { year, month });
    return api.get(`/expenses?year=${year}&month=${month}`).then(res => res.data);
  },
  delete: (id: string) => {
    console.log('expensesApi.delete - Deletando despesa:', id);
    return api.delete(`/expenses/${id}`);
  },
};

export default api;
