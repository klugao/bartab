import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { Customer, CreateCustomerDto, Tab } from '../types';
import { useToast } from '../hooks/use-toast';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface CustomerWithTabs extends Customer {
  tabs?: Tab[];
}

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerWithTabs[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithTabs[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    phone: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

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
    // Se o cliente tem tabs e balance_due negativo, calcular baseado nas tabs
    if (customer.tabs && customer.tabs.length > 0 && parseFloat(customer.balance_due) < 0) {
      const calculatedDebt = calculateTotalDebt(customer);
      // Retornar negativo para ser consistente com balance_due do banco (negativo = dívida)
      return -calculatedDebt;
    }
    // Caso contrário, usar o balance_due do banco
    return parseFloat(customer.balance_due);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Buscar todos os clientes
      const allCustomers = await customersApi.getAll();
      
      // Buscar clientes com dívidas (que incluem as tabs)
      const customersWithDebts = await customersApi.getCustomersWithDebts() as CustomerWithTabs[];
      
      // Criar um mapa de clientes com dívidas pelo ID
      const debtCustomersMap = new Map<string, CustomerWithTabs>();
      customersWithDebts.forEach(customer => {
        debtCustomersMap.set(customer.id, customer);
      });
      
      // Mesclar os dados: usar tabs dos clientes com dívidas quando disponível
      const mergedCustomers = allCustomers.map(customer => {
        const debtCustomer = debtCustomersMap.get(customer.id);
        if (debtCustomer && debtCustomer.tabs) {
          return {
            ...customer,
            tabs: debtCustomer.tabs
          };
        }
        return customer;
      }) as CustomerWithTabs[];
      
      setCustomers(mergedCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
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
      loadCustomers();
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
            {filteredCustomers.length} cliente(s) encontrado(s) de {customers.length} total
          </p>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="card">
        {customers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum cliente cadastrado</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum cliente encontrado com "{searchTerm}"
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias em Débito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
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
