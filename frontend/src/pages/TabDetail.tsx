import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { tabsApi, itemsApi } from '../services/api';
import type { Tab, Item, AddPaymentDto } from '../types';
import PaymentModal from '../components/PaymentModal';

const TabDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadTab();
      loadItems();
    }
  }, [id]);

  const loadTab = async () => {
    try {
      setLoading(true);
      const tabData = await tabsApi.getById(id!);
      setTab(tabData);
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const activeItems = await itemsApi.getActive();
      setItems(activeItems);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const handleAddItem = async (itemId: string, qty: number) => {
    try {
      await tabsApi.addItem(id!, { itemId, qty });
      setShowAddItemModal(false);
      loadTab(); // Recarregar dados da conta
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const handleRemoveItem = async (tabItemId: string) => {
    try {
      await tabsApi.removeItem(id!, tabItemId);
      loadTab(); // Recarregar dados da conta
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const handlePayment = async (paymentData: AddPaymentDto) => {
    try {
      await tabsApi.addPayment(id!, paymentData);
      setShowPaymentModal(false);
      
      // Recarregar dados da conta para verificar se foi fechada
      const updatedTab = await tabsApi.getById(id!);
      
      // Se a conta foi fechada, voltar para home
      if (updatedTab.status === 'CLOSED') {
        navigate('/');
      } else {
        loadTab(); // Recarregar dados se ainda estiver aberta
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Conta</h1>
          <p className="text-gray-600">Cliente: {customerName}</p>
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
              Aberta em: {new Date(tab.opened_at).toLocaleString('pt-BR')}
            </span>
          </div>
          {tab.status === 'CLOSED' && (
            <div className="text-sm text-gray-500">
              Finalizada em: {tab.closed_at ? new Date(tab.closed_at).toLocaleString('pt-BR') : 'Data não disponível'}
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
                <div>
                  <span className="font-medium">{tabItem.item.name} </span>
                  <span className="text-gray-500 ml-2">
                    - {tabItem.qty} UN  - R$ {parseFloat(tabItem.unit_price).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-3"><br/>
                  <span className="font-semibold">TOTAL: R$ {parseFloat(tabItem.total).toFixed(2)}</span>
                  {tab.status === 'OPEN' && (
                    <button
                      onClick={() => handleRemoveItem(tabItem.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                      title="Remover item da conta"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
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
            R$ {total.toFixed(2)}
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
                <select
                  value={selectedItem?.id || ''}
                  onChange={(e) => {
                    const item = items.find(i => i.id === e.target.value);
                    setSelectedItem(item || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - R$ {parseFloat(item.price).toFixed(2)}
                    </option>
                  ))}
                </select>
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
                  onClick={() => setShowAddItemModal(false)}
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
    </div>
  );
};

export default TabDetail;
