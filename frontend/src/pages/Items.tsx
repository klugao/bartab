import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { itemsApi } from '../services/api';
import type { Item, CreateItemDto } from '../types';

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<CreateItemDto>({
    name: '',
    price: 0,
  });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const allItems = await itemsApi.getAll();
      setItems(allItems);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemsApi.update(editingItem.id, formData);
      } else {
        await itemsApi.create(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: parseFloat(item.price),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await itemsApi.delete(id);
        loadItems();
      } catch (error) {
        console.error('Erro ao excluir item:', error);
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este item?')) {
      try {
        await itemsApi.deactivate(id);
        loadItems();
      } catch (error) {
        console.error('Erro ao desativar item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0 });
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
            {filteredItems.length} produto(s) encontrado(s) de {items.length} total
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
                        R$ {parseFloat(item.price).toFixed(2)}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={Number.isNaN(formData.price) ? '' : formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? (NaN as unknown as number) : parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
