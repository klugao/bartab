import { useState, useEffect, useMemo, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { itemsApi } from '../services/api';
import type { Item, CreateItemDto, PaginatedResponse } from '../types';
import { useToast } from '../hooks/use-toast';
import { useCurrencyInput } from '../hooks/use-currency-input';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const Items = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const loadingRef = useRef(false);

  useEffect(() => {
    // Evitar carregamentos duplicados usando ref
    if (loadingRef.current) {
      console.log('[Items] Já está carregando, ignorando chamada duplicada');
      return;
    }
    
    const loadItems = async () => {
      try {
        loadingRef.current = true;
        setLoading(true);
        
        // Se há ordenação, carregar todos os registros (sem paginação)
        // Senão, carregar apenas a página atual
        const shouldLoadAll = !!sortColumn;
        
        let response;
        if (shouldLoadAll) {
          // Carregar todos os produtos sem paginação
          // O PaginationDto tem @Max(100), então não podemos passar um limite muito alto
          // Vamos fazer múltiplas requisições se necessário, ou usar o máximo permitido (100)
          response = await itemsApi.getAll(1, 100);
          
          // Se a resposta for paginada e houver mais páginas, fazer requisições adicionais
          if (!Array.isArray(response) && response.meta && response.meta.total > 100) {
            const totalPages = Math.ceil(response.meta.total / 100);
            const allItemsData = [...response.data];
            
            // Carregar páginas adicionais
            for (let p = 2; p <= totalPages; p++) {
              try {
                const nextPage = await itemsApi.getAll(p, 100);
                if (Array.isArray(nextPage)) {
                  allItemsData.push(...nextPage);
                } else if (nextPage && nextPage.data) {
                  allItemsData.push(...nextPage.data);
                }
              } catch (pageError) {
                console.warn(`[Items] Erro ao carregar página ${p}:`, pageError);
                // Continuar mesmo se uma página falhar
              }
            }
            
            // Criar resposta unificada
            response = {
              data: allItemsData,
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
          response = await itemsApi.getAll(page, limit);
        }
        
        // Verificar se a resposta é válida
        if (!response) {
          throw new Error('Resposta vazia da API');
        }
        
        // Verificar se é resposta paginada ou array simples (compatibilidade)
        let itemsData: Item[];
        let totalCount: number;
        let totalPagesCount: number;
        
        if (Array.isArray(response)) {
          itemsData = response;
          totalCount = response.length;
          totalPagesCount = shouldLoadAll ? 1 : Math.ceil(response.length / limit);
        } else if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
          const paginatedResponse = response as PaginatedResponse<Item>;
          itemsData = Array.isArray(paginatedResponse.data) ? paginatedResponse.data : [];
          totalCount = paginatedResponse.meta?.total || itemsData.length;
          // Quando shouldLoadAll é true, usamos o total real do backend, não totalPages da resposta
          totalPagesCount = shouldLoadAll ? Math.ceil(totalCount / limit) : (paginatedResponse.meta?.totalPages || 1);
        } else {
          throw new Error('Formato de resposta inválido da API');
        }
        
        // Garantir que itemsData é um array válido
        if (!Array.isArray(itemsData)) {
          console.warn('[Items] itemsData não é um array, convertendo...');
          itemsData = [];
        }
        
        if (shouldLoadAll) {
          // Quando há ordenação, armazenar todos os produtos
          setAllItems(itemsData);
          setItems([]); // Limpar items da página atual
          setTotal(totalCount);
          // totalPages será calculado dinamicamente baseado nos dados filtrados/ordenados
          setTotalPages(1); // Valor inicial, será recalculado pelo useMemo
        } else {
          // Sem ordenação, usar comportamento normal de paginação
          setItems(itemsData);
          setAllItems([]); // Limpar allItems
          setTotal(totalCount);
          setTotalPages(totalPagesCount);
        }
      } catch (error: any) {
        console.error('Erro ao carregar itens:', error);
        console.error('Detalhes do erro:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          shouldLoadAll: !!sortColumn,
          sortColumn
        });
        
        const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido ao carregar produtos';
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Em caso de erro, limpar os dados para evitar estados inconsistentes
        if (sortColumn) {
          setAllItems([]);
        } else {
          setItems([]);
        }
        setFilteredItems([]);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };
    
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortColumn]);

  useEffect(() => {
    // Se há ordenação, usar allItems, senão usar items (página atual)
    const sourceData = sortColumn ? allItems : items;
    const filtered = sourceData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, allItems, searchTerm, sortColumn]);

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

  const sortItems = (items: Item[], column: string, direction: 'asc' | 'desc'): Item[] => {
    const sorted = [...items].sort((a, b) => {
      let aValue: string | number | boolean;
      let bValue: string | number | boolean;

      switch (column) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price);
          bValue = parseFloat(b.price);
          break;
        case 'status':
          // Ativo primeiro quando ascendente
          aValue = a.active ? 1 : 0;
          bValue = b.active ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const sortedAndFilteredItems = useMemo(() => {
    let result = filteredItems;
    if (sortColumn) {
      result = sortItems(result, sortColumn, sortDirection);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems, sortColumn, sortDirection]);

  // Aplicar paginação após ordenação quando houver ordenação ativa
  const paginatedItems = useMemo(() => {
    if (!sortColumn) {
      // Sem ordenação, usar dados da página atual
      return sortedAndFilteredItems;
    }
    // Com ordenação, aplicar paginação manualmente
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return sortedAndFilteredItems.slice(startIndex, endIndex);
  }, [sortedAndFilteredItems, page, limit, sortColumn]);

  // Recalcular totalPages quando há ordenação baseado nos dados filtrados e ordenados
  const effectiveTotalPages = useMemo(() => {
    if (sortColumn) {
      // Com ordenação, calcular baseado nos dados filtrados e ordenados
      return Math.ceil(sortedAndFilteredItems.length / limit) || 1;
    }
    // Sem ordenação, usar totalPages do backend
    return totalPages;
  }, [sortColumn, sortedAndFilteredItems.length, limit, totalPages]);

  // Resetar página se ela for maior que o total de páginas efetivas
  useEffect(() => {
    if (sortColumn && page > effectiveTotalPages && effectiveTotalPages > 0) {
      setPage(1);
    }
  }, [sortColumn, page, effectiveTotalPages]);


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
            {sortedAndFilteredItems.length} produto(s) encontrado(s){sortColumn ? ` (${paginatedItems.length} nesta página)` : ' nesta página'}
          </p>
        )}
        {!searchTerm && total > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {sortColumn 
              ? `Mostrando ${paginatedItems.length} de ${sortedAndFilteredItems.length} produto(s) - Página ${page} de ${effectiveTotalPages}`
              : `Mostrando ${items.length} de ${total} produto(s) - Página ${page} de ${totalPages}`
            }
          </p>
        )}
      </div>

      {/* Lista de itens */}
      <div className="card">
        {((sortColumn ? allItems.length === 0 : items.length === 0)) ? (
          <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>
        ) : paginatedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum produto encontrado com "{searchTerm}"
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
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Preço</span>
                      {sortColumn === 'price' ? (
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
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortColumn === 'status' ? (
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
                {paginatedItems.map((item) => (
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
