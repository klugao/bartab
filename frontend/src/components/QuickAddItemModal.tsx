import { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { itemsApi } from '../services/api';
import type { Item } from '../types';

interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string, quantity: number) => Promise<void>;
  tabId?: string;
  customerName?: string;
}

const QuickAddItemModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customerName 
}: QuickAddItemModalProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // tabId é usado implicitamente através da prop, não precisamos da variável

  useEffect(() => {
    if (isOpen) {
      loadItems();
      setSelectedItemId('');
      setQuantity(1);
      setSearchTerm('');
      setLoading(false); // Reset loading state
    }
  }, [isOpen]);

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

  const handleConfirm = async () => {
    if (!selectedItemId) return;
    
    // Prevenir múltiplos cliques
    if (loading) return;
    setLoading(true);
    
    try {
      await onConfirm(selectedItemId, quantity);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Só permite fechar se não estiver carregando
    if (loading) return;
    setSelectedItemId('');
    setQuantity(1);
    onClose();
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Adicionar Produto
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Conta:</strong> {customerName || 'Mesa sem cliente'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produto *
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
                disabled={loading}
              />
            </div>

            {/* Select de produtos */}
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
              size={8}
            >
              <option value="">Selecione um produto</option>
              {filteredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>
            {filteredItems.length === 0 && searchTerm && (
              <p className="text-sm text-gray-500 mt-1">Nenhum produto encontrado</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
          </div>

          {selectedItem && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Total do item:</div>
              <div className="text-lg font-semibold text-gray-900">
                R$ {(parseFloat(selectedItem.price) * quantity).toFixed(2).replace('.', ',')}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="btn-primary flex-1"
            disabled={loading || !selectedItemId}
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddItemModal;
