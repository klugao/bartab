import { Link } from 'react-router-dom';
import { UserIcon, CurrencyDollarIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Tab } from '../types';

interface CardTabProps {
  tab: Tab;
  onUpdate: () => void;
  onDelete?: (tabId: string) => void;
  onAddItem?: (tabId: string) => void;
}

const CardTab = ({ tab, onUpdate, onDelete, onAddItem }: CardTabProps) => {
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
    <Link to={`/tab/${tab.id}`} className="block">
      <div className="card cursor-pointer" style={{ transition: 'box-shadow 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserIcon style={{ width: '0.875rem', height: '0.875rem', color: '#9ca3af', marginRight: '0.375rem' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
              {customerName}
            </span>
          </div>
          <span 
            className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
              tab.status === 'OPEN' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
            style={{ fontSize: '0.625rem' }}
          >
            {tab.status === 'OPEN' ? 'Aberta' : 'Fechada'}
          </span>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Itens: {itemCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
            <CurrencyDollarIcon style={{ width: '0.875rem', height: '0.875rem', color: '#9ca3af', marginRight: '0.25rem' }} />
            R$ {total.toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {onAddItem && tab.status === 'OPEN' && (
            <button
              onClick={(e) => handleButtonClick(e, () => onAddItem(tab.id))}
              className="btn-primary"
              
            >
              <PlusIcon className="h-3 w-3 mr-1 inline" />
              Adicionar
            </button>
          )}
          {tab.status === 'CLOSED' && (
            <div 
              className="px-2 py-1 text-gray-500 bg-gray-100 rounded-md"
            >
              Finalizada
            </div>
          )}
          {onDelete && itemCount === 0 && tab.status === 'OPEN' && (
            <button
              onClick={(e) => handleButtonClick(e, () => onDelete(tab.id))}
              className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
              title="Excluir conta vazia"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.625rem', color: '#6b7280' }}>
          <div>
            Aberta em: {(() => {
              try {
                if (!tab.opened_at) return 'Data não disponível';
                const date = new Date(tab.opened_at);
                if (isNaN(date.getTime())) return 'Data inválida';
                return date.toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (error) {
                console.error('Erro ao formatar data de abertura:', error, tab.opened_at);
                return 'Data não disponível';
              }
            })()}
          </div>
          {tab.status === 'CLOSED' && tab.closed_at && (
            <div style={{ marginTop: '0.25rem' }}>
              Fechada em: {(() => {
                try {
                  const date = new Date(tab.closed_at);
                  if (isNaN(date.getTime())) return 'Data inválida';
                  return date.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (error) {
                  console.error('Erro ao formatar data de fechamento:', error, tab.closed_at);
                  return 'Data não disponível';
                }
              })()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CardTab;