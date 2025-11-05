import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description: string, amount: string) => Promise<void>;
  year: number;
  month: number;
}

const AddExpenseModal = ({ isOpen, onClose, onConfirm, year, month }: AddExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
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

    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor, informe um valor válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(description, amount);
      // Limpar campos após sucesso
      setDescription('');
      setAmount('');
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
      setAmount('');
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
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Energia, Fornecedor..."
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Valor (R$) *
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
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

