import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, CreditCardIcon, PencilIcon, MagnifyingGlassIcon, WifiIcon, MinusIcon } from '@heroicons/react/24/outline';
import { tabsApi, itemsApi } from '../services/api';
import type { Tab, Item, AddPaymentDto } from '../types';
import PaymentModal from '../components/PaymentModal';
import EditCustomerModal from '../components/EditCustomerModal';
import { formatCurrency, formatFullDate } from '../utils/formatters';
import { useTabOperations } from '../hooks/useTabOperations';
import { useToast } from '../hooks/use-toast';

const TabDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fromCache, setFromCache] = useState(false);

  // Hook para operações offline
  const tabOperations = useTabOperations({
    tabId: id || '',
    onSuccess: () => {
      loadTab();
    }
  });

  useEffect(() => {
    if (id) {
      loadTab();
      loadItems();
    }
  }, [id]);

  const loadTab = async () => {
    try {
      setLoading(true);
      const result = await tabOperations.loadTabWithCache();
      if (result.data) {
        setTab(result.data);
        setFromCache(result.fromCache);
      }
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados da comanda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const activeItems = await itemsApi.getActiveBestSellers();
      setItems(activeItems);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  // Filtrar itens com base no termo de busca
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleAddItem = async (itemId: string, qty: number) => {
    const result = await tabOperations.addItem(itemId, qty);
    if (result.success) {
      setShowAddItemModal(false);
      setSearchTerm('');
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const handleRemoveItem = async (tabItemId: string) => {
    await tabOperations.removeItem(tabItemId);
  };

  const handleUpdateQuantity = async (tabItemId: string, currentQty: number, increment: boolean) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    
    if (newQty < 1) {
      toast({
        title: "❌ Erro",
        description: "A quantidade não pode ser menor que 1",
        variant: "destructive",
      });
      return;
    }

    try {
      await tabsApi.updateItemQuantity(id!, tabItemId, newQty);
      toast({
        title: "✅ Sucesso",
        description: "Quantidade atualizada com sucesso",
      });
      loadTab();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar a quantidade",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (paymentData: AddPaymentDto) => {
    const result = await tabOperations.addPayment(paymentData);
    if (result.success) {
      setShowPaymentModal(false);
      
      if (!result.offline) {
        // Se processou online, verifica se a conta foi fechada
        try {
          const updatedTab = await tabsApi.getById(id!);
          if (updatedTab.status === 'CLOSED') {
            navigate('/');
          } else {
            loadTab();
          }
        } catch (error) {
          loadTab();
        }
      } else {
        // Se salvou offline, apenas atualiza
        loadTab();
      }
    }
  };

  const handleEditCustomer = async (customerId: string | null) => {
    try {
      await tabsApi.update(id!, { customerId });
      setShowEditCustomerModal(false);
      loadTab(); // Recarregar dados da conta
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
    }
  };

  const calculateTotal = () => {
    if (!tab) return 0;
    return tab.tabItems.reduce((sum, item) => {
      return sum + parseFloat(item.total);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Conta não encontrada</h3>
        <button
          onClick={() => navigate('/')}
          className="btn-primary mt-4"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  const total = calculateTotal();
  const customerName = tab.customer?.name || 'Mesa sem cliente';

  return (
    <div>
      {/* Banner de dados do cache */}
      {fromCache && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-center gap-2">
          <WifiIcon className="w-5 h-5 text-orange-600" />
          <p className="text-sm text-orange-900">
            📱 Exibindo dados salvos localmente (modo offline)
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Conta</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">Cliente: {customerName}</p>
            {tab.status === 'OPEN' && (
              <button
                onClick={() => setShowEditCustomerModal(true)}
                className="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                title="Editar cliente"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {tab.status === 'OPEN' ? (
            <>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
                Adicionar Produto
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <CreditCardIcon className="h-3.5 w-3.5 mr-1.5" />
                Pagar
              </button>
            </>
          ) : (
            <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm">
              Esta conta foi finalizada e não pode mais ser modificada
            </div>
          )}
        </div>
      </div>

      {/* Status da conta */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              tab.status === 'OPEN' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
            </span>
            <span className="ml-4 text-sm text-gray-500">
              Aberta em: {formatFullDate(tab.opened_at)}
            </span>
          </div>
          {tab.status === 'CLOSED' && (
            <div className="text-sm text-gray-500">
              Finalizada em: {tab.closed_at ? formatFullDate(tab.closed_at) : 'Data não disponível'}
            </div>
          )}
        </div>
        {tab.status === 'CLOSED' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              ✓ Esta conta foi finalizada. Todos os pagamentos foram processados e a conta está encerrada.
            </p>
          </div>
        )}
      </div>

      {/* Lista de itens */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Itens da Conta</h2>
        {tab.tabItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum item adicionado</p>
        ) : (
          <div className="space-y-3">
            {tab.tabItems.map((tabItem) => (
              <div key={tabItem.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div>
                    <span className="font-medium">{tabItem.item.name} </span>
                    <span className="text-gray-500 ml-2">
                      - {tabItem.qty} UN  - {formatCurrency(tabItem.unit_price)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Adicionado em: {formatFullDate(tabItem.created_at)}
                    {tabItem.updated_at && tabItem.created_at !== tabItem.updated_at && (
                      <span className="ml-2">
                        | Atualizado em: {formatFullDate(tabItem.updated_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">TOTAL: {formatCurrency(tabItem.total)}</span>
                  {tab.status === 'OPEN' && (
                    <>
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
                        <button
                          onClick={() => handleUpdateQuantity(tabItem.id, tabItem.qty, false)}
                          className="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Diminuir quantidade"
                          disabled={tabItem.qty <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-lg px-2">{tabItem.qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(tabItem.id, tabItem.qty, true)}
                          className="p-1.5 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                          title="Aumentar quantidade"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(tabItem.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        title="Remover item da conta"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total da conta: </span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Botão voltar */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Voltar para Home
        </button>
      </div>

      {/* Modal para adicionar item */}
      {showAddItemModal && tab.status === 'OPEN' && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h3 className="text-lg font-medium mb-4">Adicionar Produto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item
                </label>
                
                {/* Campo de busca */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Select de produtos */}
                <select
                  value={selectedItem?.id || ''}
                  onChange={(e) => {
                    const item = filteredItems.find(i => i.id === e.target.value);
                    setSelectedItem(item || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  size={8}
                >
                  <option value="">Selecione um item</option>
                  {filteredItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
                {filteredItems.length === 0 && searchTerm && (
                  <p className="text-sm text-gray-500 mt-1">Nenhum produto encontrado</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setSearchTerm('');
                    setSelectedItem(null);
                    setQuantity(1);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedItem) {
                      handleAddItem(selectedItem.id, quantity);
                    }
                  }}
                  className="btn-primary flex-1"
                  disabled={!selectedItem}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pagamento */}
      <PaymentModal
        isOpen={showPaymentModal && tab.status === 'OPEN'}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePayment}
        total={total}
      />

      {/* Modal de edição de cliente */}
      <EditCustomerModal
        isOpen={showEditCustomerModal}
        onClose={() => setShowEditCustomerModal(false)}
        onConfirm={handleEditCustomer}
        currentCustomerId={tab.customer?.id}
      />
    </div>
  );
};

export default TabDetail;
