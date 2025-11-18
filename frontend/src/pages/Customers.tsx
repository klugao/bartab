import { useState, useEffect, useMemo, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { Customer, CreateCustomerDto, Tab, PaginatedResponse } from '../types';
import { useToast } from '../hooks/use-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface CustomerWithTabs extends Customer {
  tabs?: Tab[];
}

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerWithTabs[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerWithTabs[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithTabs[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    phone: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const loadingRef = useRef(false);

  useEffect(() => {
    // Evitar carregamentos duplicados usando ref
    if (loadingRef.current) {
      console.log('[Customers] Já está carregando, ignorando chamada duplicada');
      return;
    }
    
    const loadCustomers = async () => {
      try {
        loadingRef.current = true;
        setLoading(true);
        
        // Se há ordenação, carregar todos os registros (sem paginação)
        // Senão, carregar apenas a página atual
        const shouldLoadAll = !!sortColumn;
        
        let response;
        if (shouldLoadAll) {
          // Carregar todos os clientes sem paginação
          // O PaginationDto tem @Max(100), então não podemos passar um limite muito alto
          // Vamos fazer múltiplas requisições se necessário, ou usar o máximo permitido (100)
          // Por enquanto, vamos usar 100 e fazer múltiplas requisições se houver mais registros
          response = await customersApi.getAll(1, 100);
          
          // Se a resposta for paginada e houver mais páginas, fazer requisições adicionais
          if (!Array.isArray(response) && response.meta && response.meta.total > 100) {
            const totalPages = Math.ceil(response.meta.total / 100);
            const allCustomersData = [...response.data];
            
            // Carregar páginas adicionais
            for (let p = 2; p <= totalPages; p++) {
              try {
                const nextPage = await customersApi.getAll(p, 100);
                if (Array.isArray(nextPage)) {
                  allCustomersData.push(...nextPage);
                } else if (nextPage && nextPage.data) {
                  allCustomersData.push(...nextPage.data);
                }
              } catch (pageError) {
                console.warn(`[Customers] Erro ao carregar página ${p}:`, pageError);
                // Continuar mesmo se uma página falhar
              }
            }
            
            // Criar resposta unificada
            response = {
              data: allCustomersData,
              meta: {
                total: response.meta.total,
                page: 1,
                limit: 100,
                totalPages: totalPages
              }
            };
          }
        } else {
          // Carregar apenas a página atual
          response = await customersApi.getAll(page, limit);
        }
        
        // Verificar se a resposta é válida
        if (!response) {
          throw new Error('Resposta vazia da API');
        }
        
        // Verificar se é resposta paginada ou array simples (compatibilidade)
        let customersData: Customer[];
        let totalCount: number;
        let totalPagesCount: number;
        
        if (Array.isArray(response)) {
          customersData = response;
          totalCount = response.length;
          totalPagesCount = shouldLoadAll ? 1 : Math.ceil(response.length / limit);
        } else if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
          const paginatedResponse = response as PaginatedResponse<Customer>;
          customersData = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : [];
          totalCount = paginatedResponse.meta?.total || customersData.length;
          // Quando shouldLoadAll é true, usamos o total real do backend, não totalPages da resposta
          totalPagesCount = shouldLoadAll ? Math.ceil(totalCount / limit) : (paginatedResponse.meta?.totalPages || 1);
        } else {
          throw new Error('Formato de resposta inválido da API');
        }
        
        // Garantir que customersData é um array válido
        if (!Array.isArray(customersData)) {
          console.warn('[Customers] customersData não é um array, convertendo...');
          customersData = [];
        }
        
        console.log(`[Customers] Dados recebidos: ${customersData.length} clientes, total: ${totalCount}, shouldLoadAll: ${shouldLoadAll}`);
        
        // Buscar clientes com dívidas (que incluem as tabs)
        // IMPORTANTE: getCustomersWithDebts pode não retornar todos os clientes, apenas os que têm dívidas
        // Por isso, sempre usamos customersData como base e apenas mesclamos as tabs quando disponíveis
        let customersWithDebts: CustomerWithTabs[] = [];
        try {
          customersWithDebts = await customersApi.getCustomersWithDebts() as CustomerWithTabs[];
        } catch (debtError: any) {
          console.warn('Erro ao carregar clientes com dívidas (continuando sem tabs):', debtError);
          // Continuar sem as tabs se houver erro - não é crítico
          customersWithDebts = [];
        }
        
        // Criar um mapa de clientes com dívidas pelo ID
        const debtCustomersMap = new Map<string, CustomerWithTabs>();
        if (Array.isArray(customersWithDebts)) {
          customersWithDebts.forEach(customer => {
            if (customer && customer.id) {
              debtCustomersMap.set(customer.id, customer);
            }
          });
        }
        
        // Mesclar os dados: usar tabs dos clientes com dívidas quando disponível
        // Garantir que TODOS os clientes de customersData sejam incluídos
        const mergedCustomers = customersData.map(customer => {
          if (!customer || !customer.id) return customer;
          const debtCustomer = debtCustomersMap.get(customer.id);
          if (debtCustomer && debtCustomer.tabs) {
            return {
              ...customer,
              tabs: debtCustomer.tabs
            };
          }
          // Retornar o cliente mesmo sem tabs (importante para garantir que todos sejam incluídos)
          return customer;
        }) as CustomerWithTabs[];
        
        console.log(`[Customers] Carregados ${mergedCustomers.length} clientes (shouldLoadAll: ${shouldLoadAll}, totalCount: ${totalCount})`);
        
        if (shouldLoadAll) {
          // Quando há ordenação, armazenar todos os clientes
          setAllCustomers(mergedCustomers);
          setCustomers([]); // Limpar customers da página atual
          setTotal(totalCount);
          // totalPages será calculado dinamicamente baseado nos dados filtrados/ordenados
          setTotalPages(1); // Valor inicial, será recalculado pelo useMemo
        } else {
          // Sem ordenação, usar comportamento normal de paginação
          setCustomers(mergedCustomers);
          setAllCustomers([]); // Limpar allCustomers
          setTotal(totalCount);
          setTotalPages(totalPagesCount);
        }
      } catch (error: any) {
        console.error('Erro ao carregar clientes:', error);
        console.error('Detalhes do erro:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          shouldLoadAll: !!sortColumn,
          sortColumn
        });
        
        const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido ao carregar clientes';
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Em caso de erro, limpar os dados para evitar estados inconsistentes
        if (sortColumn) {
          setAllCustomers([]);
        } else {
          setCustomers([]);
        }
        setFilteredCustomers([]);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };
    
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortColumn]);

  useEffect(() => {
    // Se há ordenação, usar allCustomers, senão usar customers (página atual)
    const sourceData = sortColumn ? allCustomers : customers;
    // Garantir que sourceData seja um array válido
    if (!Array.isArray(sourceData)) {
      setFilteredCustomers([]);
      return;
    }
    // Se há ordenação mas ainda não carregou os dados, não filtrar ainda
    if (sortColumn && sourceData.length === 0) {
      setFilteredCustomers([]);
      return;
    }
    const filtered = sourceData.filter(customer =>
      customer && customer.name && (
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      )
    );
    setFilteredCustomers(filtered);
  }, [customers, allCustomers, searchTerm, sortColumn]);

  // Funções para calcular o saldo devedor baseado nas tabs
  const calculateTabTotal = (tab: Tab): number => {
    if (!tab.tabItems) return 0;
    return tab.tabItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
  };

  const calculateTabPaid = (tab: Tab): number => {
    if (!tab.payments) return 0;
    // NÃO contar pagamentos LATER como efetivamente pagos
    return tab.payments.reduce((sum, payment) => {
      if (payment.method === 'LATER') {
        return sum;
      }
      return sum + parseFloat(payment.amount);
    }, 0);
  };

  const calculateTabRemaining = (tab: Tab): number => {
    const total = calculateTabTotal(tab);
    const paid = calculateTabPaid(tab);
    return total - paid;
  };

  const calculateTotalDebt = (customer: CustomerWithTabs): number => {
    const closedTabsWithDebt = customer.tabs?.filter(tab => {
      const isClosedTab = tab.status === 'CLOSED';
      const remaining = calculateTabRemaining(tab);
      const hasDebt = remaining > 0;
      return isClosedTab && hasDebt;
    }) || [];
    
    const totalDebt = closedTabsWithDebt.reduce((sum, tab) => {
      const remaining = calculateTabRemaining(tab);
      return sum + remaining;
    }, 0);
    
    return totalDebt;
  };

  const getCustomerBalance = (customer: CustomerWithTabs): number => {
    try {
      if (!customer) return 0;
      
      // Se o cliente tem tabs e balance_due negativo, calcular baseado nas tabs
      if (customer.tabs && customer.tabs.length > 0 && customer.balance_due && parseFloat(customer.balance_due) < 0) {
        const calculatedDebt = calculateTotalDebt(customer);
        // Retornar negativo para ser consistente com balance_due do banco (negativo = dívida)
        return -calculatedDebt;
      }
      // Caso contrário, usar o balance_due do banco
      return customer.balance_due ? parseFloat(customer.balance_due) : 0;
    } catch (error) {
      console.error(`[Customers] Erro ao calcular saldo do cliente:`, error);
      return 0;
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se já está ordenando por esta coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nova coluna, começa com ascendente
      setSortColumn(column);
      setSortDirection('asc');
      setPage(1); // Voltar para primeira página ao mudar ordenação
    }
  };

  const sortCustomers = (customers: CustomerWithTabs[], column: string, direction: 'asc' | 'desc'): CustomerWithTabs[] => {
    if (!Array.isArray(customers) || customers.length === 0) {
      return [];
    }
    
    try {
      const sorted = [...customers].sort((a, b) => {
        // Verificações de segurança
        if (!a || !b) return 0;
        
        let aValue: string | number;
        let bValue: string | number;

        try {
          switch (column) {
            case 'name':
              aValue = (a.name || '').toLowerCase();
              bValue = (b.name || '').toLowerCase();
              break;
            case 'phone':
              aValue = (a.phone || '').toLowerCase();
              bValue = (b.phone || '').toLowerCase();
              break;
            case 'days_in_debt':
              aValue = a.days_in_negative_balance !== null && a.days_in_negative_balance >= 0 ? a.days_in_negative_balance : -1;
              bValue = b.days_in_negative_balance !== null && b.days_in_negative_balance >= 0 ? b.days_in_negative_balance : -1;
              break;
            case 'balance':
              aValue = getCustomerBalance(a);
              bValue = getCustomerBalance(b);
              break;
            default:
              return 0;
          }

          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
          return 0;
        } catch (error) {
          console.error(`[Customers] Erro ao ordenar cliente:`, error);
          return 0;
        }
      });

      return sorted;
    } catch (error) {
      console.error(`[Customers] Erro na função sortCustomers:`, error);
      return customers; // Retornar array original em caso de erro
    }
  };

  const sortedAndFilteredCustomers = useMemo(() => {
    try {
      if (!Array.isArray(filteredCustomers)) {
        return [];
      }
      
      let result = filteredCustomers;
      if (sortColumn) {
        result = sortCustomers(result, sortColumn, sortDirection);
        console.log(`[Customers] Ordenação aplicada: ${sortColumn} ${sortDirection}, ${result.length} clientes após ordenação`);
      }
      return result;
    } catch (error) {
      console.error(`[Customers] Erro ao ordenar/filtrar clientes:`, error);
      return filteredCustomers || [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCustomers, sortColumn, sortDirection]);

  // Aplicar paginação após ordenação quando houver ordenação ativa
  const paginatedCustomers = useMemo(() => {
    if (!sortColumn) {
      // Sem ordenação, usar dados da página atual
      return sortedAndFilteredCustomers;
    }
    // Com ordenação, aplicar paginação manualmente
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = sortedAndFilteredCustomers.slice(startIndex, endIndex);
    console.log(`[Customers] Paginação: página ${page}, ${paginated.length} de ${sortedAndFilteredCustomers.length} clientes (índices ${startIndex}-${endIndex})`);
    return paginated;
  }, [sortedAndFilteredCustomers, page, limit, sortColumn]);

  // Recalcular totalPages quando há ordenação baseado nos dados filtrados e ordenados
  const effectiveTotalPages = useMemo(() => {
    if (sortColumn) {
      // Com ordenação, calcular baseado nos dados filtrados e ordenados
      return Math.ceil(sortedAndFilteredCustomers.length / limit) || 1;
    }
    // Sem ordenação, usar totalPages do backend
    return totalPages;
  }, [sortColumn, sortedAndFilteredCustomers.length, limit, totalPages]);

  // Resetar página se ela for maior que o total de páginas efetivas
  useEffect(() => {
    if (sortColumn && page > effectiveTotalPages && effectiveTotalPages > 0) {
      setPage(1);
    }
  }, [sortColumn, page, effectiveTotalPages]);

  const loadCustomers = async () => {
    // Evitar carregamentos duplicados
    if (loading) {
      console.log('[Customers] Já está carregando, ignorando chamada duplicada');
      return;
    }
    
    // Se há ordenação, carregar todos os registros (sem paginação)
    // Senão, carregar apenas a página atual
    const shouldLoadAll = !!sortColumn;
    
    try {
      setLoading(true);
      
      let response;
      if (shouldLoadAll) {
        // Carregar todos os clientes sem paginação
        // O PaginationDto tem @Max(100), então não podemos passar um limite muito alto
        // Vamos fazer múltiplas requisições se necessário, ou usar o máximo permitido (100)
        // Por enquanto, vamos usar 100 e fazer múltiplas requisições se houver mais registros
        response = await customersApi.getAll(1, 100);
        
        // Se a resposta for paginada e houver mais páginas, fazer requisições adicionais
        if (!Array.isArray(response) && response.meta && response.meta.total > 100) {
          const totalPages = Math.ceil(response.meta.total / 100);
          const allCustomersData = [...response.data];
          
          // Carregar páginas adicionais
          for (let p = 2; p <= totalPages; p++) {
            try {
              const nextPage = await customersApi.getAll(p, 100);
              if (Array.isArray(nextPage)) {
                allCustomersData.push(...nextPage);
              } else if (nextPage && nextPage.data) {
                allCustomersData.push(...nextPage.data);
              }
            } catch (pageError) {
              console.warn(`[Customers] Erro ao carregar página ${p}:`, pageError);
              // Continuar mesmo se uma página falhar
            }
          }
          
          // Criar resposta unificada
          response = {
            data: allCustomersData,
            meta: {
              total: response.meta.total,
              page: 1,
              limit: 100,
              totalPages: totalPages
            }
          };
        }
      } else {
        // Carregar apenas a página atual
        response = await customersApi.getAll(page, limit);
      }
      
      // Verificar se a resposta é válida
      if (!response) {
        throw new Error('Resposta vazia da API');
      }
      
      // Verificar se é resposta paginada ou array simples (compatibilidade)
      let customersData: Customer[];
      let totalCount: number;
      let totalPagesCount: number;
      
      if (Array.isArray(response)) {
        customersData = response;
        totalCount = response.length;
        totalPagesCount = shouldLoadAll ? 1 : Math.ceil(response.length / limit);
      } else if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
        const paginatedResponse = response as PaginatedResponse<Customer>;
        customersData = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : [];
        totalCount = paginatedResponse.meta?.total || customersData.length;
        // Quando shouldLoadAll é true, usamos o total real do backend, não totalPages da resposta
        totalPagesCount = shouldLoadAll ? Math.ceil(totalCount / limit) : (paginatedResponse.meta?.totalPages || 1);
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
      
      // Garantir que customersData é um array válido
      if (!Array.isArray(customersData)) {
        console.warn('[Customers] customersData não é um array, convertendo...');
        customersData = [];
      }
      
      console.log(`[Customers] Dados recebidos: ${customersData.length} clientes, total: ${totalCount}, shouldLoadAll: ${shouldLoadAll}`);
      
      // Buscar clientes com dívidas (que incluem as tabs)
      // IMPORTANTE: getCustomersWithDebts pode não retornar todos os clientes, apenas os que têm dívidas
      // Por isso, sempre usamos customersData como base e apenas mesclamos as tabs quando disponíveis
      let customersWithDebts: CustomerWithTabs[] = [];
      try {
        customersWithDebts = await customersApi.getCustomersWithDebts() as CustomerWithTabs[];
      } catch (debtError: any) {
        console.warn('Erro ao carregar clientes com dívidas (continuando sem tabs):', debtError);
        // Continuar sem as tabs se houver erro - não é crítico
        customersWithDebts = [];
      }
      
      // Criar um mapa de clientes com dívidas pelo ID
      const debtCustomersMap = new Map<string, CustomerWithTabs>();
      if (Array.isArray(customersWithDebts)) {
        customersWithDebts.forEach(customer => {
          if (customer && customer.id) {
            debtCustomersMap.set(customer.id, customer);
          }
        });
      }
      
      // Mesclar os dados: usar tabs dos clientes com dívidas quando disponível
      // Garantir que TODOS os clientes de customersData sejam incluídos
      const mergedCustomers = customersData.map(customer => {
        if (!customer || !customer.id) return customer;
        const debtCustomer = debtCustomersMap.get(customer.id);
        if (debtCustomer && debtCustomer.tabs) {
          return {
            ...customer,
            tabs: debtCustomer.tabs
          };
        }
        // Retornar o cliente mesmo sem tabs (importante para garantir que todos sejam incluídos)
        return customer;
      }) as CustomerWithTabs[];
      
      console.log(`[Customers] Carregados ${mergedCustomers.length} clientes (shouldLoadAll: ${shouldLoadAll}, totalCount: ${totalCount})`);
      
      if (shouldLoadAll) {
        // Quando há ordenação, armazenar todos os clientes
        setAllCustomers(mergedCustomers);
        setCustomers([]); // Limpar customers da página atual
        setTotal(totalCount);
        // totalPages será calculado dinamicamente baseado nos dados filtrados/ordenados
        setTotalPages(1); // Valor inicial, será recalculado pelo useMemo
      } else {
        // Sem ordenação, usar comportamento normal de paginação
        setCustomers(mergedCustomers);
        setAllCustomers([]); // Limpar allCustomers
        setTotal(totalCount);
        setTotalPages(totalPagesCount);
      }
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      console.error('Detalhes do erro:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        shouldLoadAll,
        sortColumn
      });
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido ao carregar clientes';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Em caso de erro, limpar os dados para evitar estados inconsistentes
      if (shouldLoadAll) {
        setAllCustomers([]);
      } else {
        setCustomers([]);
      }
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplos submits
    if (submitting) return;
    setSubmitting(true);
    
    try {
      console.log('Enviando dados do cliente:', formData);
      if (editingCustomer) {
        const updated = await customersApi.update(editingCustomer.id, formData);
        console.log('Cliente atualizado:', updated);
        toast({
          title: 'Sucesso!',
          description: 'Cliente atualizado com sucesso!',
        });
      } else {
        const created = await customersApi.create(formData);
        console.log('Cliente criado:', created);
        toast({
          title: 'Sucesso!',
          description: 'Cliente criado com sucesso!',
        });
      }
      setShowForm(false);
      setEditingCustomer(null);
      resetForm();
      setPage(1); // Voltar para primeira página após criar/editar
      loadCustomers();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      console.error('Resposta do erro:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao salvar cliente';
      toast({
        title: 'Erro',
        description: `Erro ao salvar cliente: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      await customersApi.delete(customerToDelete);
      toast({
        title: 'Sucesso!',
        description: 'Cliente excluído com sucesso!',
      });
      // Se a página atual ficar vazia após deletar, voltar para página anterior
      if (customers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadCustomers();
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '' });
  };

  const openNewForm = () => {
    setEditingCustomer(null);
    resetForm();
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
        <button
          onClick={openNewForm}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
          Novo Cliente
        </button>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar clientes por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            {sortedAndFilteredCustomers.length} cliente(s) encontrado(s){sortColumn ? ` (${paginatedCustomers.length} nesta página)` : ' nesta página'}
          </p>
        )}
        {!searchTerm && total > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {sortColumn 
              ? `Mostrando ${paginatedCustomers.length} de ${sortedAndFilteredCustomers.length} cliente(s) - Página ${page} de ${effectiveTotalPages}`
              : `Mostrando ${customers.length} de ${total} cliente(s) - Página ${page} de ${totalPages}`
            }
          </p>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="card">
        {((sortColumn ? allCustomers.length === 0 : customers.length === 0)) ? (
          <p className="text-gray-500 text-center py-8">Nenhum cliente cadastrado</p>
        ) : paginatedCustomers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum cliente encontrado com "{searchTerm}"
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nome</span>
                      {sortColumn === 'name' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Telefone</span>
                      {sortColumn === 'phone' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('days_in_debt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Dias em Débito</span>
                      {sortColumn === 'days_in_debt' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Saldo</span>
                      {sortColumn === 'balance' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {customer.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        customer.days_in_negative_balance !== null && customer.days_in_negative_balance > 0
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {customer.days_in_negative_balance !== null && customer.days_in_negative_balance >= 0 ? (
                          <span>{customer.days_in_negative_balance} {customer.days_in_negative_balance === 1 ? 'dia' : 'dias'}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const balance = getCustomerBalance(customer);
                        const isNegative = balance < 0;
                        return (
                          <div className={`text-sm font-medium ${
                            isNegative 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {isNegative ? (
                              <span>R$ {Math.abs(balance).toFixed(2).replace('.', ',')}</span>
                            ) : (
                              <span>R$ {balance.toFixed(2).replace('.', ',')}</span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                          title="Editar cliente"
                        >Editar cliente
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir cliente"
                        >Excluir cliente
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Controles de paginação */}
      {((sortColumn && effectiveTotalPages > 1) || (!sortColumn && totalPages > 1)) && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {page} de {sortColumn ? effectiveTotalPages : totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(sortColumn ? effectiveTotalPages : totalPages, p + 1))}
              disabled={page === (sortColumn ? effectiveTotalPages : totalPages)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              Próxima
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Modal do formulário */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h3 className="text-lg font-medium mb-4">
              {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={submitting}
                  maxLength={255}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={submitting}
                  maxLength={20}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (editingCustomer ? 'Atualizando...' : 'Criando...') : (editingCustomer ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default Customers;
