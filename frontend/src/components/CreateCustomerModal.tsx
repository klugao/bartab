import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { CreateCustomerDto, Customer } from '../types';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

const CreateCustomerModal = ({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) => {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newCustomer = await customersApi.create(formData);
      // Limpar formulário
      setFormData({ name: '', phone: '', email: '' });
      onSuccess(newCustomer);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar cliente';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 60 }}>
      <div className="modal-content p-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Criar Novo Cliente</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

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
              placeholder="Nome do cliente"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="(00) 00000-0000"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email@exemplo.com"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Criando...' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomerModal;

