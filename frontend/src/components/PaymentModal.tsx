import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AddPaymentDto } from '../types';
import { PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCurrencyInput } from '../hooks/use-currency-input';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: AddPaymentDto) => void;
  onPixSelected?: (amount: string) => void;
  total: number;
}

const PaymentModal = ({ isOpen, onClose, onConfirm, onPixSelected, total }: PaymentModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [loading, setLoading] = useState(false);
  const amountInput = useCurrencyInput(total);

  // Resetar amount quando total mudar
  useEffect(() => {
    amountInput.setValue(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Resetar loading quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplos submits
    if (loading) return;
    setLoading(true);
    
    try {
      // Se for PIX, chama callback especial ao invés de confirmar diretamente
      if (method === PaymentMethod.PIX && onPixSelected) {
        onPixSelected(amountInput.numericValue.toString());
        return;
      }
      
      onConfirm({
        method,
        amount: amountInput.numericValue.toString(),
      });
    } finally {
      // Nota: o loading será resetado quando o modal fechar via useEffect
    }
  };

  const handleMethodChange = (newMethod: PaymentMethod) => {
    setMethod(newMethod);
    // Se mudar para LATER, sempre setar o valor total
    if (newMethod === PaymentMethod.LATER) {
      amountInput.setValue(total);
    }
  };

  const handleClose = () => {
    // Só permite fechar se não estiver processando
    if (loading) return;
    setMethod(PaymentMethod.CASH);
    amountInput.setValue(total);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const amountNum = amountInput.numericValue;
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
      <div className="modal-content p-4">
        <div className="mt-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              Processar Pagamento
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Total da conta */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="text-sm text-gray-600">Total da Conta:</div>
              <div className="text-xl font-bold text-gray-900">
                R$ {total.toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Método de pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Método de Pagamento *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => handleMethodChange(pm.value)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      method === pm.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{pm.icon}</div>
                    <div className="text-xs font-medium">{pm.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valor do pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valor do Pagamento *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amountInput.displayValue}
                  onChange={amountInput.handleChange}
                  onKeyDown={amountInput.handleKeyDown}
                  disabled={method === PaymentMethod.LATER || loading}
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    method === PaymentMethod.LATER || loading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="0,00"
                />
              </div>
              
              {method === PaymentMethod.LATER && (
                <p className="text-xs text-blue-600 mt-1">
                  ℹ️ Valor fixo no total da conta (pagamento posterior)
                </p>
              )}
              
              {method !== PaymentMethod.LATER && isPartialPayment && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs text-amber-800 font-medium">
                    ⚠️ Pagamento Parcial
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Restante de <strong>{formatCurrency(remainingAmount)}</strong> será registrado como dívida (fiado)
                  </p>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex space-x-2 pt-1">
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
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
