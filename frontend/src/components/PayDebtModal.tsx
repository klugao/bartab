import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useCurrencyInput } from '../hooks/use-currency-input';
import type { Customer } from '../types';

interface PayDebtModalProps {
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}

const PayDebtModal = ({ customer, onClose, onSuccess }: PayDebtModalProps) => {
  const debtAmount = Math.abs(parseFloat(customer.balance_due));
  const amountInput = useCurrencyInput(debtAmount);
  const [method, setMethod] = useState<string>('CASH');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const isPartial = amountInput.numericValue > 0 && amountInput.numericValue < debtAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = amountInput.numericValue;
    
    if (amountInput.isEmpty || paymentAmount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    if (paymentAmount > debtAmount) {
      alert('O valor do pagamento não pode ser maior que a dívida');
      return;
    }

    try {
      setLoading(true);
      await customersApi.payDebt(customer.id, {
        amount: paymentAmount.toString(),
        method,
        note: note || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Registrar Pagamento
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">Cliente:</p>
          <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
          <div className="mt-2">
            <p className="text-sm text-gray-600">Dívida Total:</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(debtAmount)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor do Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Pagamento *
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amountInput.displayValue}
                  onChange={amountInput.handleChange}
                  onKeyDown={amountInput.handleKeyDown}
                  placeholder="0,00"
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  amountInput.setValue(debtAmount);
                }}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Total
              </button>
            </div>
            {isPartial && (
              <p className="mt-1 text-sm text-amber-600">
                ⚠️ Pagamento parcial - Restará {formatCurrency(debtAmount - amountInput.numericValue)}
              </p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento *
            </label>
            <select
              required
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="CASH">Dinheiro</option>
              <option value="DEBIT">Débito</option>
              <option value="CREDIT">Crédito</option>
              <option value="PIX">PIX</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Adicione uma observação sobre o pagamento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dívida Atual:</span>
              <span className="font-semibold text-red-600">{formatCurrency(debtAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagamento:</span>
              <span className="font-semibold text-green-600">
                -{formatCurrency(amountInput.numericValue)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-900">Saldo Final:</span>
              <span className={`font-bold ${
                debtAmount - amountInput.numericValue <= 0.01 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(Math.max(0, debtAmount - amountInput.numericValue))}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Processando...' : isPartial ? 'Pagar Parcial' : 'Pagar Total'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayDebtModal;

