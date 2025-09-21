import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { tabsApi } from '../services/api';
import type { Tab } from '../types';
import CardTab from '../components/CardTab';
import NewTabModal from '../components/NewTabModal';

const Home = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTabModal, setShowNewTabModal] = useState(false);

  useEffect(() => {
    loadOpenTabs();
  }, []);

  const loadOpenTabs = async () => {
    try {
      setLoading(true);
      const openTabs = await tabsApi.getOpen();
      setTabs(openTabs);
    } catch (error) {
      console.error('Erro ao carregar contas abertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTab = async (customerId?: string) => {
    try {
      await tabsApi.open({ customerId });
      setShowNewTabModal(false);
      loadOpenTabs(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao abrir nova conta:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Contas Abertas</h1>
        <button
          onClick={() => setShowNewTabModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <PlusIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
          Nova Conta
        </button>
      </div>

      {tabs.length === 0 ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <UserIcon style={{ width: '3rem', height: '3rem', margin: '0 auto', color: '#9ca3af' }} />
          <h3 style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
            Nenhuma conta aberta
          </h3>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Comece abrindo uma nova conta para gerenciar pedidos.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => setShowNewTabModal(true)}
              className="btn-primary"
            >
              <PlusIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
              Abrir Primeira Conta
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
          {tabs.map((tab) => (
            <CardTab key={tab.id} tab={tab} onUpdate={loadOpenTabs} />
          ))}
        </div>
      )}

      <NewTabModal
        isOpen={showNewTabModal}
        onClose={() => setShowNewTabModal(false)}
        onConfirm={handleNewTab}
      />
    </div>
  );
};

export default Home;
