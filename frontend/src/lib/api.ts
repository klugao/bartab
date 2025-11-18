import axios, { AxiosError, type AxiosResponse } from 'axios';
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
import { API_BASE_URL } from './config';

// Tipos para tratamento de erros
interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Função para extrair mensagem de erro
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Erro de resposta do servidor
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Erro de status HTTP
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          return 'Dados inválidos. Verifique as informações e tente novamente.';
        case 401:
          return 'Não autorizado. Faça login novamente.';
        case 403:
          return 'Acesso negado.';
        case 404:
          return 'Recurso não encontrado.';
        case 422:
          return 'Dados inválidos. Verifique as informações.';
        case 500:
          return 'Erro interno do servidor. Tente novamente mais tarde.';
        default:
          return `Erro HTTP ${axiosError.response.status}`;
      }
    }
    
    // Erro de rede
    if (axiosError.code === 'NETWORK_ERROR' || axiosError.code === 'ERR_NETWORK') {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    // Timeout
    if (axiosError.code === 'ECONNABORTED') {
      return 'Tempo limite excedido. Tente novamente.';
    }
    
    return axiosError.message || 'Erro desconhecido';
  }
  
  // Erro genérico
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
};

// Wrapper para requisições com tratamento de erro padronizado
const makeRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  errorContext?: string
): Promise<T> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    const contextualMessage = errorContext 
      ? `${errorContext}: ${errorMessage}`
      : errorMessage;
    
    // Log do erro para debug
    console.error('API Error:', {
      context: errorContext,
      error: errorMessage,
      originalError: error,
    });
    
    // Re-throw com mensagem padronizada
    throw new Error(contextualMessage);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT (quando implementar autenticação)
api.interceptors.request.use(
  (config) => {
    // SECURITY: localStorage é usado para armazenar o token JWT
    // Estamos cientes dos riscos de XSS, mas é a abordagem padrão para SPAs
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros de autenticação com refresh automático
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
  (response) => {
    // Log de respostas (desenvolvimento)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    }
    return response;
  },
  async (error) => {
    // Log de erros (desenvolvimento)
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    }

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
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
  getAll: () => makeRequest(
    () => api.get<Customer[]>('/customers'),
    'Erro ao carregar clientes'
  ),
  
  getById: (id: string) => makeRequest(
    () => api.get<Customer>(`/customers/${id}`),
    'Erro ao carregar cliente'
  ),
  
  create: (data: CreateCustomerDto) => makeRequest(
    () => api.post<Customer>('/customers', data),
    'Erro ao criar cliente'
  ),
  
  update: (id: string, data: Partial<CreateCustomerDto>) => makeRequest(
    () => api.patch<Customer>(`/customers/${id}`, data),
    'Erro ao atualizar cliente'
  ),
  
  delete: (id: string) => makeRequest(
    () => api.delete(`/customers/${id}`),
    'Erro ao excluir cliente'
  ),
};

// Items API
export const itemsApi = {
  getAll: () => makeRequest(
    () => api.get<Item[]>('/items'),
    'Erro ao carregar itens'
  ),
  
  getActive: () => makeRequest(
    () => api.get<Item[]>('/items/active'),
    'Erro ao carregar itens ativos'
  ),
  
  getById: (id: string) => makeRequest(
    () => api.get<Item>(`/items/${id}`),
    'Erro ao carregar item'
  ),
  
  create: (data: CreateItemDto) => makeRequest(
    () => api.post<Item>('/items', data),
    'Erro ao criar item'
  ),
  
  update: (id: string, data: Partial<CreateItemDto>) => makeRequest(
    () => api.patch<Item>(`/items/${id}`, data),
    'Erro ao atualizar item'
  ),
  
  delete: (id: string) => makeRequest(
    () => api.delete(`/items/${id}`),
    'Erro ao excluir item'
  ),
  
  deactivate: (id: string) => makeRequest(
    () => api.patch<Item>(`/items/${id}/deactivate`),
    'Erro ao desativar item'
  ),
};

// Tabs API
export const tabsApi = {
  open: (data: CreateTabDto) => makeRequest(
    () => api.post<Tab>('/tabs', data),
    'Erro ao abrir nova conta'
  ),
  
  getOpen: () => makeRequest(
    () => api.get<Tab[]>('/tabs'),
    'Erro ao carregar contas abertas'
  ),
  
  getById: (id: string) => makeRequest(
    () => api.get<Tab>(`/tabs/${id}`),
    'Erro ao carregar detalhes da conta'
  ),
  
  addItem: (tabId: string, data: AddItemDto) => makeRequest(
    () => api.post<TabItem>('/tabs/add-item', { tabId, ...data }),
    'Erro ao adicionar item à conta'
  ),
  
  removeItem: (tabId: string, tabItemId: string) => makeRequest(
    () => api.post('/tabs/remove-item', { tabId, tabItemId }),
    'Erro ao remover item da conta'
  ),
  
  addPayment: (tabId: string, data: AddPaymentDto) => makeRequest(
    () => api.post<Payment>('/tabs/add-payment', { tabId, ...data }),
    'Erro ao processar pagamento'
  ),
  
  close: (id: string) => makeRequest(
    () => api.patch<Tab>(`/tabs/${id}/close`),
    'Erro ao fechar conta'
  ),
  
  delete: (id: string) => makeRequest(
    () => api.post('/tabs/delete-tab', { tabId: id }),
    'Erro ao excluir conta'
  ),
  
  // Método para "pagar depois" - adiciona ao saldo devedor
  payLater: (tabId: string) => makeRequest(
    () => api.post('/tabs/pay-later', { tabId }),
    'Erro ao registrar conta como "pagar depois"'
  ),
};

// Dívidas API (placeholder para futuras implementações)
export const debtApi = {
  getAll: () => makeRequest(
    () => api.get<any[]>('/debts'),
    'Erro ao carregar dívidas'
  ),
  
  payDebt: (clientId: string, amount: number, method: string) => makeRequest(
    () => api.post('/debts/pay', { clientId, amount, method }),
    'Erro ao registrar pagamento de dívida'
  ),
};

export default api;
