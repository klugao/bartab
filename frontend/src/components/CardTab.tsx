import { Link } from 'react-router-dom';
import { UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { Tab } from '../types';

interface CardTabProps {
  tab: Tab;
  onUpdate: () => void;
}

const CardTab = ({ tab, onUpdate }: CardTabProps) => {
  const calculateTotal = () => {
    return tab.tabItems.reduce((sum, item) => {
      return sum + parseFloat(item.total);
    }, 0);
  };

  const total = calculateTotal();
  const customerName = tab.customer?.name || 'Mesa sem cliente';

  return (
    <div className="card" style={{ transition: 'box-shadow 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af', marginRight: '0.5rem' }} />
          <span style={{ fontWeight: '500', color: '#111827' }}>
            {customerName}
          </span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#dcfce7', color: '#166534' }}>
          Aberta
        </span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Itens: {tab.tabItems.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
          <CurrencyDollarIcon style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af', marginRight: '0.25rem' }} />
          R$ {total.toFixed(2)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link
          to={`/tab/${tab.id}`}
          className="btn-primary"
          style={{ flex: 1, textAlign: 'center' }}
        >
          Ver Detalhes
        </Link>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
        Aberta em: {new Date(tab.opened_at).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default CardTab;
