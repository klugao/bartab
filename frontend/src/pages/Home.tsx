import { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { tabsApi, customersApi } from '../services/api';
import type { Tab, Customer } from '../types';
import CardTab from '../components/CardTab';
import NewTabModal from '../components/NewTabModal';
import ErrorBoundary from '../components/ErrorBoundary';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import QuickAddItemModal from '../components/QuickAddItemModal';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { addOfflineTab, isOnline } from '../services/offlineStorage';
import { formatDateOnly } from '../utils/formatters';

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
  const [showAllClosed, setShowAllClosed] = useState<boolean>(false);

  const { toast } = useToast();

  const loadOpenTabs = async () => {
    try {
      setError(null);
      const data = await tabsApi.getOpen();
      setOpenTabs(data);
    } catch (error) {
      console.error('Erro ao carregar contas abertas:', error);
      const errorMessage = 'Erro ao carregar contas abertas. Tente novamente.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const loadClosedTabs = async () => {
    try {
      setError(null);
      let data;
      
      // Se houver filtro de data de fechamento, buscar apenas aquela data específica
      if (closeDateFilter) {
        const filterDate = new Date(closeDateFilter);
        const startDate = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0, 0).toISOString();
        const endDate = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 23, 59, 59, 999).toISOString();
        data = await tabsApi.getClosed(startDate, endDate);
      }
      // Se "Mostrar todas" estiver ativo, buscar últimos 90 dias
      else if (showAllClosed) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString();
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
        data = await tabsApi.getClosed(startDate, endDate);
      }
      // Senão, buscar apenas do dia atual (comportamento padrão do backend)
      else {
        data = await tabsApi.getClosed();
      }
      
      setClosedTabs(data);
    } catch (error) {
      console.error('Erro ao carregar contas fechadas:', error);
      const errorMessage = 'Erro ao carregar contas fechadas. Tente novamente.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar clientes.",
      });
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

  // Recarregar contas fechadas quando filtros mudarem
  useEffect(() => {
    if (activeTab === 'closed') {
      loadClosedTabs();
    }
  }, [closeDateFilter, showAllClosed]);

  const handleNewTab = async (customerId?: string) => {
    try {
      if (isOnline()) {
        // Online: cria diretamente no servidor
        try {
          const data = customerId ? { customerId } : {};
          await tabsApi.open(data);
          await loadOpenTabs();
          setShowNewTabModal(false);
          toast({
            variant: "default",
            title: "✅ Sucesso",
            description: "Nova conta aberta com sucesso!",
          });
        } catch (error) {
          // Se falhar online, tenta salvar offline
          console.error('Erro ao criar conta online, salvando offline:', error);
          await addOfflineTab(customerId);
          setShowNewTabModal(false);
          toast({
            title: "⚠️ Erro de conexão",
            description: "Conta salva offline e será criada quando voltar online",
          });
        }
      } else {
        // Offline: salva localmente
        await addOfflineTab(customerId);
        setShowNewTabModal(false);
        toast({
          title: "💾 Conta salva offline",
          description: "Será criada no servidor quando voltar online",
        });
      }
    } catch (error) {
      console.error('Erro ao abrir nova conta:', error);
      const errorMessage = 'Erro ao abrir nova conta. Tente novamente.';
      setError(errorMessage);
      setShowNewTabModal(false); // Fechar modal mesmo em caso de erro
      toast({
        variant: "destructive",
        title: "❌ Erro",
        description: errorMessage,
      });
    }
  };

  const handleDeleteTab = (tabId: string) => {
    setTabToDelete(tabId);
    setShowDeleteModal(true);
  };

  const handleUpdateQuantity = async (tabId: string, tabItemId: string, currentQty: number, increment: boolean) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    
    if (newQty < 1) {
      toast({
        title: "❌ Erro",
        description: "A quantidade não pode ser menor que 1. Use o botão de excluir para remover o item.",
        variant: "destructive",
      });
      return;
    }

    try {
      await tabsApi.updateItemQuantity(tabId, tabItemId, newQty);
      await loadOpenTabs();
      toast({
        title: "✅ Sucesso",
        description: "Quantidade atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!tabToDelete) return;
    
    setDeleteLoading(true);
    try {
      await tabsApi.delete(tabToDelete);
      await loadOpenTabs();
      setShowDeleteModal(false);
      setTabToDelete(null);
      toast({
        variant: "default",
        title: "Sucesso",
        description: "Conta excluída com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      const errorMessage = 'Erro ao excluir conta. Tente novamente.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
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
    toast({
      variant: "default",
      title: "Sucesso",
      description: "Item adicionado com sucesso!",
    });
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          {error && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="text-destructive font-medium">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadData}
                      className="mt-3"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('open')}
                  className={`py-4 px-2 border-b-2 font-medium text-lg transition-colors ${
                    activeTab === 'open'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Contas Abertas ({openTabs.length})
                </button>
                <button
                  onClick={() => setActiveTab('closed')}
                  className={`py-4 px-2 border-b-2 font-medium text-lg transition-colors ${
                    activeTab === 'closed'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Contas Fechadas ({closedTabs.length})
                </button>
              </div>
            </div>
          </div>

          {/* Actions and Filters */}
          <div className="mb-6 flex flex-col gap-4">
            {activeTab === 'open' ? (
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Contas Abertas</h1>
                <Button 
                  onClick={() => setShowNewTabModal(true)}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Nova Conta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold">Contas Fechadas</h1>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                    {showAllClosed 
                      ? '📅 Exibindo últimos 90 dias' 
                      : closeDateFilter 
                        ? `📅 ${formatDateOnly(closeDateFilter)}` 
                        : '📅 Hoje'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por Cliente */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Cliente</label>
                    <select
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="w-full h-12 px-4 py-3 text-lg rounded-2xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Aberta em</label>
                    <Input
                      type="date"
                      value={openDateFilter}
                      onChange={(e) => setOpenDateFilter(e.target.value)}
                    />
                  </div>

                  {/* Filtro por Data de Fechamento */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Fechada em</label>
                    <Input
                      type="date"
                      value={closeDateFilter}
                      onChange={(e) => setCloseDateFilter(e.target.value)}
                      disabled={showAllClosed}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Botão para mostrar todas as contas */}
                  {!showAllClosed && !closeDateFilter && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowAllClosed(true)}
                    >
                      Ver últimos 90 dias
                    </Button>
                  )}
                  
                  {/* Limpar Filtros */}
                  {(customerFilter || openDateFilter || closeDateFilter || showAllClosed) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCustomerFilter('');
                        setOpenDateFilter('');
                        setCloseDateFilter('');
                        setShowAllClosed(false);
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs Grid */}
          {currentTabs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-lg">
                    {activeTab === 'open' 
                      ? 'Nenhuma conta aberta no momento'
                      : 'Nenhuma conta fechada encontrada'
                    }
                  </p>
                  {activeTab === 'open' && (
                    <Button 
                      onClick={() => setShowNewTabModal(true)}
                      size="lg"
                      className="gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Abrir Nova Conta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {currentTabs.map((tab) => (
                <CardTab
                  key={tab.id}
                  tab={tab}
                  onUpdate={loadOpenTabs}
                  onDelete={activeTab === 'open' ? handleDeleteTab : undefined}
                  onAddItem={activeTab === 'open' ? handleQuickAddItem : undefined}
                  onUpdateQuantity={activeTab === 'open' ? handleUpdateQuantity : undefined}
                />
              ))}
            </div>
          )}

          {/* Floating Action Button for Mobile */}
          {activeTab === 'open' && (
            <Button
              onClick={() => setShowNewTabModal(true)}
              size="lg"
              className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg md:hidden z-50 p-0"
              aria-label="Nova Conta"
            >
              <Plus className="h-8 w-8" />
            </Button>
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