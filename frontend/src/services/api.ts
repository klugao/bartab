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
  AddPaymentDto,
  Establishment,
  UpdateEstablishmentDto,
  PaginatedResponse
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
  // SECURITY: localStorage é usado para armazenar o token JWT
  // Estamos cientes dos riscos de XSS, mas é a abordagem padrão para SPAs
  // O backend valida e expira tokens, e o frontend usa HTTPS em produção
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros de autenticação
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Se já está renovando, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem('token');

      if (currentToken) {
        try {
          // Tenta renovar o token
          const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data.access_token;
            localStorage.setItem('token', newToken);
            
            // Processa a fila de requisições pendentes
            processQueue(null, newToken);
            isRefreshing = false;

            // Retenta a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            // Não conseguiu renovar, faz logout
            processQueue(new Error('Token refresh failed'), null);
            isRefreshing = false;
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Erro ao tentar renovar
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        // Não há token, faz logout
        isRefreshing = false;
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Customers API
export const customersApi = {
  getAll: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return api.get<Customer[] | PaginatedResponse<Customer>>(`/customers${queryString ? `?${queryString}` : ''}`).then(res => res.data);
  },
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
  getAll: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return api.get<Item[] | PaginatedResponse<Item>>(`/items${queryString ? `?${queryString}` : ''}`).then(res => res.data);
  },
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
  updateItemQuantity: (tabId: string, tabItemId: string, qty: number) => {
    console.log('tabsApi.updateItemQuantity - Atualizando quantidade:', { tabId, tabItemId, qty });
    return api.post<TabItem>('/tabs/update-item-quantity', { tabId, tabItemId, qty }).then(res => res.data);
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

// Profile API
export const profileApi = {
  get: () => api.get<Establishment>('/auth/profile').then(res => res.data),
  update: (data: UpdateEstablishmentDto) => api.patch<Establishment>('/auth/profile', data).then(res => res.data),
};

export default api;
