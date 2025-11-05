import { Link } from 'react-router-dom';
import { User, DollarSign, Trash2, Plus, Minus } from 'lucide-react';
import type { Tab } from '../types';
import { formatCurrency, formatShortDate, formatFullDate } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CardTabProps {
  tab: Tab;
  onUpdate?: () => void;
  onDelete?: (tabId: string) => void;
  onAddItem?: (tabId: string) => void;
  onUpdateQuantity?: (tabId: string, tabItemId: string, currentQty: number, increment: boolean) => void;
}

const CardTab = ({ tab, onDelete, onAddItem, onUpdateQuantity }: CardTabProps) => {
  const calculateTotal = () => {
    if (!tab.tabItems || !Array.isArray(tab.tabItems)) {
      return 0;
    }
    return tab.tabItems.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total);
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  };

  const total = calculateTotal();
  const customerName = tab.customer?.name || 'Mesa sem cliente';
  const itemCount = tab.tabItems?.length || 0;

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link to={`/tab/${tab.id}`} className="block group">
      <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg font-semibold truncate">
                {customerName}
              </CardTitle>
            </div>
            <Badge 
              variant={tab.status === 'OPEN' ? 'success' : 'secondary'}
              className="shrink-0"
            >
              {tab.status === 'OPEN' ? 'Aberta' : 'Fechada'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Resumo da conta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Itens: {itemCount}</span>
              <span>Aberta: {formatShortDate(tab.opened_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-primary">
              <DollarSign className="h-5 w-5" />
              {formatCurrency(total)}
            </div>
          </div>

          {/* Lista de itens da conta */}
          {tab.tabItems && tab.tabItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Itens recentes:
              </h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {tab.tabItems.slice(-3).map((tabItem) => (
                  <div 
                    key={tabItem.id} 
                    className="flex justify-between items-center text-sm bg-muted/50 rounded-lg p-2 gap-2"
                  >
                    <span className="truncate flex-1">
                      {tabItem.qty}× {tabItem.item.name}
                    </span>
                    
                    {/* Controles de quantidade (apenas para contas abertas) */}
                    {tab.status === 'OPEN' && onUpdateQuantity && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onUpdateQuantity(tab.id, tabItem.id, tabItem.qty, false);
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onUpdateQuantity(tab.id, tabItem.id, tabItem.qty, true);
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    <span className="font-medium text-primary shrink-0 ml-1">
                      {formatCurrency(tabItem.total)}
                    </span>
                  </div>
                ))}
                {tab.tabItems.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{tab.tabItems.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {onAddItem && tab.status === 'OPEN' && (
              <Button
                onClick={(e) => handleButtonClick(e, () => onAddItem(tab.id))}
                size="sm"
                className="flex-1 gap-1"
                aria-label={`Adicionar item à conta de ${customerName}`}
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            )}
            
            {tab.status === 'CLOSED' && (
              <Badge variant="secondary" className="flex-1 justify-center py-2">
                Finalizada
              </Badge>
            )}
            
            {onDelete && itemCount === 0 && tab.status === 'OPEN' && (
              <Button
                onClick={(e) => handleButtonClick(e, () => onDelete(tab.id))}
                variant="destructive"
                size="sm"
                className="gap-1"
                aria-label={`Excluir conta vazia de ${customerName}`}
              >
                <Trash2 className="h-3 w-3" />
                Excluir
              </Button>
            )}
          </div>

          {/* Data de fechamento para contas fechadas */}
          {tab.status === 'CLOSED' && tab.closed_at && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Fechada em: {formatFullDate(tab.closed_at)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CardTab;