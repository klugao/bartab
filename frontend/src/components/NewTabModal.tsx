import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { Customer } from '../types';

interface NewTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId?: string) => void;
}

const NewTabModal = ({ isOpen, onClose, onConfirm }: NewTabModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      setSelectedCustomerId(''); // Reset selection when opening
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const allCustomers = await customersApi.getAll();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleConfirm = () => {
    console.log('NewTabModal.handleConfirm - selectedCustomerId:', selectedCustomerId);
    console.log('NewTabModal.handleConfirm - selectedCustomerId type:', typeof selectedCustomerId);
    console.log('NewTabModal.handleConfirm - selectedCustomerId length:', selectedCustomerId?.length);
    setLoading(true);
    const customerId = selectedCustomerId && selectedCustomerId.trim() !== '' ? selectedCustomerId : undefined;
    console.log('NewTabModal.handleConfirm - customerId final:', customerId);
    onConfirm(customerId);
    setLoading(false);
    // Reset after confirm
    setSelectedCustomerId('');
  };

  const handleClose = () => {
    setSelectedCustomerId('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Nova Conta
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente (opcional)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sem cliente (mesa)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
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
              disabled={loading}
            >
              {loading ? 'Abrindo...' : 'Abrir Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTabModal;
