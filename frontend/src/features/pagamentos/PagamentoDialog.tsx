import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/use-toast';

interface PagamentoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (method: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'pagar_depois') => Promise<void>;
  total: number;
  customerName?: string;
  contaId: string;
}

const paymentMethods = [
  {
    id: 'dinheiro' as const,
    label: 'Dinheiro',
    icon: Banknote,
    description: 'Pagamento em espécie',
    variant: 'default' as const,
  },
  {
    id: 'debito' as const,
    label: 'Cartão de Débito',
    icon: CreditCard,
    description: 'Pagamento no débito',
    variant: 'default' as const,
  },
  {
    id: 'credito' as const,
    label: 'Cartão de Crédito',
    icon: CreditCard,
    description: 'Pagamento no crédito',
    variant: 'default' as const,
  },
  {
    id: 'pix' as const,
    label: 'PIX',
    icon: Smartphone,
    description: 'Pagamento via PIX',
    variant: 'default' as const,
  },
  {
    id: 'pagar_depois' as const,
    label: 'Pagar Depois',
    icon: Clock,
    description: 'Adicionar ao saldo devedor',
    variant: 'outline' as const,
  },
];

export const PagamentoDialog = ({
  isOpen,
  onClose,
  onPayment,
  total,
  customerName,
}: PagamentoDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePayment = async (method: typeof paymentMethods[0]['id']) => {
    try {
      setLoading(true);
      setSelectedMethod(method);
      
      await onPayment(method);
      
      // Feedback específico por método
      const methodLabels = {
        dinheiro: 'dinheiro',
        debito: 'cartão de débito',
        credito: 'cartão de crédito',
        pix: 'PIX',
        pagar_depois: 'conta fiado',
      };

      toast({
        variant: "default",
        title: "Pagamento realizado!",
        description: method === 'pagar_depois' 
          ? `Valor adicionado ao saldo devedor de ${customerName || 'cliente'}.`
          : `Pagamento de ${formatCurrency(total)} realizado via ${methodLabels[method]}.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento. Tente novamente.",
      });
    } finally {
      setLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Finalizar Pagamento</DialogTitle>
          <DialogDescription className="text-lg">
            {customerName && (
              <span className="block font-medium text-foreground mb-2">
                Cliente: {customerName}
              </span>
            )}
            <span className="text-2xl font-bold text-primary">
              Total: {formatCurrency(total)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <p className="text-base font-medium">Selecione a forma de pagamento:</p>
          
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isLoading = loading && selectedMethod === method.id;
            
            return (
              <Button
                key={method.id}
                variant={method.variant}
                size="lg"
                onClick={() => handlePayment(method.id)}
                disabled={loading}
                className="w-full justify-start gap-3 h-16 text-left"
                aria-label={`Pagar via ${method.label} - ${method.description}`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg">{method.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.description}
                  </div>
                </div>
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
