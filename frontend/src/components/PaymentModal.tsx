import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AddPaymentDto } from '../types';
import { PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: AddPaymentDto) => void;
  total: number;
}

const PaymentModal = ({ isOpen, onClose, onConfirm, total }: PaymentModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amount, setAmount] = useState(total.toFixed(2).replace('.', ','));
  const [note, setNote] = useState('');

  // Resetar amount quando total mudar
  const [prevTotal, setPrevTotal] = useState(total);
  if (total !== prevTotal) {
    setAmount(total.toFixed(2).replace('.', ','));
    setPrevTotal(total);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      method,
      amount: amount.replace(',', '.'), // Converter para formato numérico
      note: note.trim() || undefined,
    });
  };

  const handleMethodChange = (newMethod: PaymentMethod) => {
    setMethod(newMethod);
    // Se mudar para LATER, sempre setar o valor total
    if (newMethod === PaymentMethod.LATER) {
      setAmount(total.toFixed(2).replace('.', ','));
    }
  };

  const handleClose = () => {
    setMethod(PaymentMethod.CASH);
    setAmount(total.toFixed(2).replace('.', ','));
    setNote('');
    onClose();
  };

  if (!isOpen) return null;

  const amountNum = parseFloat(amount.replace(',', '.') || '0');
  const isPartialPayment = amountNum > 0 && amountNum < total;
  const remainingAmount = total - amountNum;

  const paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Dinheiro', icon: '💵' },
    { value: PaymentMethod.DEBIT, label: 'Débito', icon: '💳' },
    { value: PaymentMethod.CREDIT, label: 'Crédito', icon: '💳' },
    { value: PaymentMethod.PIX, label: 'PIX', icon: '📱' },
    { value: PaymentMethod.LATER, label: 'Pagar Depois', icon: '⏰' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Processar Pagamento
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >Fechar
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total da conta */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Total da Conta:</div>
              <div className="text-xl font-bold text-gray-900">
                R$ {total.toFixed(2).replace('.', ',')}
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
                    onClick={() => handleMethodChange(pm.value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      method === pm.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                Valor do Pagamento *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    setAmount(value);
                  }}
                  disabled={method === PaymentMethod.LATER}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    method === PaymentMethod.LATER ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="0,00"
                />
              </div>
              
              {method === PaymentMethod.LATER && (
                <p className="text-sm text-blue-600 mt-1">
                  ℹ️ Valor fixo no total da conta (pagamento posterior)
                </p>
              )}
              
              {method !== PaymentMethod.LATER && isPartialPayment && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Pagamento Parcial
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Restante de <strong>{formatCurrency(remainingAmount)}</strong> será registrado como dívida (fiado)
                  </p>
                </div>
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
