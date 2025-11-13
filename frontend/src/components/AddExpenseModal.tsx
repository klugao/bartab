import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useCurrencyInput } from '../hooks/use-currency-input';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description: string, amount: string) => Promise<void>;
  year: number;
  month: number;
}

const AddExpenseModal = ({ isOpen, onClose, onConfirm, year, month }: AddExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const amountInput = useCurrencyInput(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!description.trim()) {
      setError('Por favor, informe a descrição da despesa');
      return;
    }

    if (amountInput.isEmpty || amountInput.numericValue <= 0) {
      setError('Por favor, informe um valor válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(description, amountInput.numericValue.toString());
      // Limpar campos após sucesso
      setDescription('');
      amountInput.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      setError('Erro ao adicionar despesa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDescription('');
      amountInput.reset();
      setError('');
      onClose();
    }
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Adicionar Despesa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Período: <span className="font-semibold capitalize">{monthName}</span>
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descrição da Despesa *
            </label>
            <input
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Energia, Fornecedor..."
              disabled={loading}
              autoFocus
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-600 text-sm">R$</span>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amountInput.displayValue}
                onChange={amountInput.handleChange}
                onKeyDown={amountInput.handleKeyDown}
                placeholder="0,00"
                disabled={loading}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;

