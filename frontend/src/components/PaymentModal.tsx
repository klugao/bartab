import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AddPaymentDto, PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: AddPaymentDto) => void;
  total: number;
}

const PaymentModal = ({ isOpen, onClose, onConfirm, total }: PaymentModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amount, setAmount] = useState(total.toFixed(2));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      method,
      amount,
      note: note.trim() || undefined,
    });
  };

  const handleClose = () => {
    setMethod(PaymentMethod.CASH);
    setAmount(total.toFixed(2));
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Dinheiro', icon: '💵' },
    { value: PaymentMethod.DEBIT, label: 'Débito', icon: '💳' },
    { value: PaymentMethod.CREDIT, label: 'Crédito', icon: '💳' },
    { value: PaymentMethod.PIX, label: 'PIX', icon: '📱' },
    { value: PaymentMethod.LATER, label: 'Pagar Depois', icon: '⏰' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Processar Pagamento
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total da conta */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Total da Conta:</div>
              <div className="text-xl font-bold text-gray-900">
                R$ {total.toFixed(2)}
              </div>
            </div>

            {/* Método de pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pagamento *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setMethod(pm.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      method === pm.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pm.icon}</div>
                    <div className="text-sm font-medium">{pm.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valor do pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
              {method === PaymentMethod.LATER && (
                <p className="text-sm text-yellow-600 mt-1">
                  ⚠️ O valor restante será adicionado ao saldo devedor do cliente
                </p>
              )}
            </div>

            {/* Nota/observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Observações sobre o pagamento..."
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Confirmar Pagamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
