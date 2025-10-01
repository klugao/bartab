import { useState, useEffect } from 'react';
import { PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { tabsApi, customersApi } from '../services/api';
import type { Tab, Customer } from '../types';
import CardTab from '../components/CardTab';
import NewTabModal from '../components/NewTabModal';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import QuickAddItemModal from '../components/QuickAddItemModal';

const Home = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [closedTabs, setClosedTabs] = useState<Tab[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedTabForAdd, setSelectedTabForAdd] = useState<Tab | null>(null);
  
  // Filtros para contas fechadas
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [openDateFilter, setOpenDateFilter] = useState<string>('');
  const [closeDateFilter, setCloseDateFilter] = useState<string>('');

  const loadOpenTabs = async () => {
    try {
      setError(null);
      const data = await tabsApi.getOpen();
      setOpenTabs(data);
    } catch (error) {
      console.error('Erro ao carregar contas abertas:', error);
      setError('Erro ao carregar contas abertas. Tente novamente.');
    }
  };

  const loadClosedTabs = async () => {
    try {
      setError(null);
      // TODO: Implementar endpoint para contas fechadas no backend
      // Por enquanto, deixamos vazio para evitar erro
      setClosedTabs([]);
    } catch (error) {
      console.error('Erro ao carregar contas fechadas:', error);
      setError('Erro ao carregar contas fechadas. Tente novamente.');
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOpenTabs(),
        loadClosedTabs(),
        loadCustomers()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewTab = async (customerId?: string) => {
    try {
      const data = customerId ? { customerId } : {};
      await tabsApi.open(data);
      await loadOpenTabs();
      setShowNewTabModal(false);
    } catch (error) {
      console.error('Erro ao abrir nova conta:', error);
      setError('Erro ao abrir nova conta. Tente novamente.');
    }
  };

  const handleDeleteTab = (tabId: string) => {
    setTabToDelete(tabId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!tabToDelete) return;
    
    setDeleteLoading(true);
    try {
      await tabsApi.delete(tabToDelete);
      await loadOpenTabs();
      setShowDeleteModal(false);
      setTabToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setError('Erro ao excluir conta. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickAddItem = (tabId: string) => {
    const tab = currentTabs.find(t => t.id === tabId);
    if (tab) {
      setSelectedTabForAdd(tab);
      setShowQuickAddModal(true);
    }
  };

  const handleItemAdded = async () => {
    await loadOpenTabs();
    setShowQuickAddModal(false);
    setSelectedTabForAdd(null);
  };

  // Filtrar contas fechadas
  const filteredClosedTabs = closedTabs.filter(tab => {
    const matchesCustomer = !customerFilter || 
      (tab.customer && tab.customer.name.toLowerCase().includes(customerFilter.toLowerCase()));
    
    const matchesOpenDate = !openDateFilter || 
      (tab.opened_at && tab.opened_at.startsWith(openDateFilter));
    
    const matchesCloseDate = !closeDateFilter || 
      (tab.closed_at && tab.closed_at.startsWith(closeDateFilter));

    return matchesCustomer && matchesOpenDate && matchesCloseDate;
  });

  const currentTabs = activeTab === 'open' ? openTabs : filteredClosedTabs;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button
                    onClick={loadData}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'open'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contas Abertas ({openTabs.length})
                </button>
                <button
                  onClick={() => setActiveTab('closed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'closed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Contas Fechadas ({closedTabs.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Actions and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            {activeTab === 'open' ? (
                <button
                  onClick={() => setShowNewTabModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                Nova Conta
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Filtro por Cliente */}
                <div className="relative">
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os clientes</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.name}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Data de Abertura */}
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1">Aberta em:</label>
                  <input
                    type="date"
                    value={openDateFilter}
                    onChange={(e) => setOpenDateFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filtro por Data de Fechamento */}
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1">Fechada em:</label>
                  <input
                    type="date"
                    value={closeDateFilter}
                    onChange={(e) => setCloseDateFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Limpar Filtros */}
                {(customerFilter || openDateFilter || closeDateFilter) && (
                  <button
                    onClick={() => {
                      setCustomerFilter('');
                      setOpenDateFilter('');
                      setCloseDateFilter('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tabs Grid */}
          {currentTabs.length === 0 ? (
            <div className="text-center py-12">
              {activeTab === 'open' && (
                 <button
                   onClick={() => setShowNewTabModal(true)}
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                 >
                   <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                   Nova Conta
                 </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentTabs.map((tab) => (
                <CardTab
                  key={tab.id}
                  tab={tab}
                  onUpdate={loadOpenTabs}
                  onDelete={activeTab === 'open' ? handleDeleteTab : undefined}
                  onAddItem={activeTab === 'open' ? handleQuickAddItem : undefined}
                />
              ))}
            </div>
          )}

          {/* Modals */}
          <NewTabModal
            isOpen={showNewTabModal}
            onClose={() => setShowNewTabModal(false)}
            onConfirm={handleNewTab}
          />

          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            loading={deleteLoading}
            title="Excluir Conta"
            message="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
          />

          <QuickAddItemModal
            isOpen={showQuickAddModal}
            onClose={() => {
              setShowQuickAddModal(false);
              setSelectedTabForAdd(null);
            }}
            onConfirm={async (itemId: string, quantity: number) => {
              if (selectedTabForAdd) {
                await tabsApi.addItem(selectedTabForAdd.id, { itemId, qty: quantity });
                await handleItemAdded();
              }
            }}
            tabId={selectedTabForAdd?.id || ''}
            customerName={selectedTabForAdd?.customer?.name}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;