import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { Customer } from '../types';
import CreateCustomerModal from './CreateCustomerModal';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string | null) => void;
  currentCustomerId?: string;
}

const EditCustomerModal = ({ isOpen, onClose, onConfirm, currentCustomerId }: EditCustomerModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      setSelectedCustomerId(currentCustomerId || '');
    }
  }, [isOpen, currentCustomerId]);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === '__create_new__') {
      setShowCreateModal(true);
    } else {
      setSelectedCustomerId(value);
    }
  };

  const handleCustomerCreated = async (newCustomer: Customer) => {
    // Atualizar lista de clientes
    await loadCustomers();
    // Selecionar o novo cliente
    setSelectedCustomerId(newCustomer.id);
    setShowCreateModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Se não selecionou nenhum cliente, passa null
      const customerId = selectedCustomerId === '' ? null : selectedCustomerId;
      onConfirm(customerId);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Editar Cliente</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o cliente
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sem cliente (Mesa)</option>
              <option value="__create_new__" className="font-semibold text-primary-600">
                + Criar Novo Cliente
              </option>
              <option disabled>──────────</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de criação de cliente */}
      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
};

export default EditCustomerModal;

