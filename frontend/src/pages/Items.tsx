import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { itemsApi } from '../services/api';
import type { Item, CreateItemDto, PaginatedResponse } from '../types';
import { useToast } from '../hooks/use-toast';
import { useCurrencyInput } from '../hooks/use-currency-input';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Items = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateItemDto>({
    name: '',
    price: 0,
  });
  const priceInput = useCurrencyInput(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeactivate, setItemToDeactivate] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [page]);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getAll(page, limit);
      
      // Verificar se é resposta paginada ou array simples (compatibilidade)
      if (Array.isArray(response)) {
        setItems(response);
        setTotal(response.length);
        setTotalPages(1);
      } else {
        const paginatedResponse = response as PaginatedResponse<Item>;
        setItems(paginatedResponse.data);
        setTotal(paginatedResponse.meta.total);
        setTotalPages(paginatedResponse.meta.totalPages);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que o preço não está vazio
    if (priceInput.isEmpty || priceInput.numericValue <= 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um preço válido',
        variant: 'destructive',
      });
      return;
    }
    
    // Prevenir múltiplos submits
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const itemData = {
        ...formData,
        price: priceInput.numericValue,
      };
      
      if (editingItem) {
        await itemsApi.update(editingItem.id, itemData);
        toast({
          title: 'Sucesso!',
          description: 'Produto atualizado com sucesso!',
        });
      } else {
        await itemsApi.create(itemData);
        toast({
          title: 'Sucesso!',
          description: 'Produto criado com sucesso!',
        });
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      setPage(1); // Voltar para primeira página após criar/editar
      loadItems();
    } catch (error: any) {
      console.error('Erro ao salvar item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao salvar produto';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: parseFloat(item.price),
    });
    priceInput.setValue(parseFloat(item.price));
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await itemsApi.delete(itemToDelete);
      toast({
        title: 'Sucesso!',
        description: 'Produto excluído com sucesso!',
      });
      // Se a página atual ficar vazia após deletar, voltar para página anterior
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadItems();
      }
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao excluir produto';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeactivate = (id: string) => {
    setItemToDeactivate(id);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!itemToDeactivate) return;
    
    try {
      await itemsApi.deactivate(itemToDeactivate);
      toast({
        title: 'Sucesso!',
        description: 'Produto desativado com sucesso!',
      });
      loadItems();
    } catch (error: any) {
      console.error('Erro ao desativar item:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao desativar produto';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setShowDeactivateModal(false);
      setItemToDeactivate(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0 });
    priceInput.reset();
  };

  const openNewForm = () => {
    setEditingItem(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={openNewForm}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
          Novo Produto
        </button>
      </div>

      {/* Campo de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar produtos por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            {filteredItems.length} produto(s) encontrado(s) nesta página
          </p>
        )}
        {!searchTerm && total > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {items.length} de {total} produto(s) - Página {page} de {totalPages}
          </p>
        )}
      </div>

      {/* Lista de itens */}
      <div className="card">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum produto encontrado com "{searchTerm}"
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
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                       <button
                         onClick={() => handleEdit(item)}
                         className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                         title="Editar item"
                       >Editar item
                         <PencilIcon className="h-3.5 w-3.5" />
                       </button>
                       {item.active ? (
                         <button
                           onClick={() => handleDeactivate(item.id)}
                           className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors"
                           title="Desativar item"
                         >Desativar item
                           <EyeSlashIcon className="h-3.5 w-3.5" />
                         </button>
                       ) : null}
                       <button
                         onClick={() => handleDelete(item.id)}
                         className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                         title="Excluir item"
                       >Excluir item
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
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {page} de {totalPages}
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
              {editingItem ? 'Editar Item' : 'Novo Item'}
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
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={priceInput.displayValue}
                    onChange={priceInput.handleChange}
                    onKeyDown={priceInput.handleKeyDown}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0,00"
                    disabled={submitting}
                  />
                </div>
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
                  {submitting ? (editingItem ? 'Atualizando...' : 'Criando...') : (editingItem ? 'Atualizar' : 'Criar')}
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
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />

      {/* Modal de confirmação de desativação */}
      <ConfirmDeleteModal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setItemToDeactivate(null);
        }}
        onConfirm={confirmDeactivate}
        title="Desativar Produto"
        message="Tem certeza que deseja desativar este produto?"
      />
    </div>
  );
};

export default Items;
