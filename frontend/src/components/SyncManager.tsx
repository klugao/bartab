import { useEffect, useState } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';
import { tabsApi } from '@/services/api';
import type { OfflineExpense, OfflinePayment } from '@/services/offlineStorage';
import { Button } from './ui/button';
import { RefreshCw, X, CheckCircle, AlertTriangle } from 'lucide-react';

export function SyncManager() {
  const { toast } = useToast();
  const { 
    online, 
    hasPendingData, 
    stats,
    syncOfflineData,
    isSyncing,
    checkPendingData
  } = useOfflineStorage();
  
  const [autoSync, setAutoSync] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sincronização automática quando voltar online
  useEffect(() => {
    if (online && hasPendingData && autoSync && !isSyncing) {
      // Pequeno delay para dar tempo de estabilizar a conexão
      const timer = setTimeout(() => {
        handleSync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [online, hasPendingData, autoSync, isSyncing]);

  async function handleSync() {
    const result = await syncOfflineData(
      // Função para sincronizar lançamentos
      async (expense: OfflineExpense) => {
        await tabsApi.addItem(expense.tabId.toString(), {
          itemId: expense.itemId.toString(),
          qty: expense.quantity
        });
      },
      // Função para sincronizar pagamentos
      async (payment: OfflinePayment) => {
        await tabsApi.addPayment(payment.tabId.toString(), {
          amount: payment.amount.toString(),
          method: payment.paymentMethod as any // Type assertion necessária pois paymentMethod vem como string
        });
      }
    );

    if (result.success) {
      setLastSyncTime(new Date());
      toast({
        title: "✅ Sincronização Concluída",
        description: result.message,
      });
      // Recarrega estatísticas
      checkPendingData();
    } else {
      toast({
        title: "❌ Erro na Sincronização",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  // Não mostrar se não houver dados pendentes e não estiver sincronizando
  if (!hasPendingData && !isSyncing) {
    return null;
  }

  const totalPending = (stats?.expenses.pending || 0) + (stats?.payments.pending || 0);

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-sm">
      <div className={`
        bg-white rounded-lg shadow-xl border-2 transition-all
        ${online ? 'border-blue-500' : 'border-orange-500'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {isSyncing ? (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>Dados Pendentes</span>
                </>
              )}
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
            >
              {showDetails ? <X className="w-4 h-4" /> : '▼'}
            </button>
          </div>

          {/* Resumo rápido */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{totalPending}</span>
            <span>
              {totalPending === 1 ? 'item pendente' : 'itens pendentes'}
            </span>
          </div>

          {lastSyncTime && !hasPendingData && (
            <div className="flex items-center gap-2 text-xs text-green-600 mt-2">
              <CheckCircle className="w-4 h-4" />
              <span>
                Última sincronização: {lastSyncTime.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {/* Detalhes expandidos */}
        {showDetails && stats && (
          <div className="p-4 border-b border-gray-200 space-y-3 bg-gray-50">
            {/* Lançamentos */}
            {stats.expenses.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Lançamentos
                  </span>
                  <span className="text-xs text-gray-500">
                    {stats.expenses.pending} pendentes
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded text-center">
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold">{stats.expenses.total}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="text-green-700">Sync</div>
                    <div className="font-semibold text-green-600">
                      {stats.expenses.synced}
                    </div>
                  </div>
                  {stats.expenses.errors > 0 && (
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="text-red-700">Erros</div>
                      <div className="font-semibold text-red-600">
                        {stats.expenses.errors}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagamentos */}
            {stats.payments.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Pagamentos
                  </span>
                  <span className="text-xs text-gray-500">
                    {stats.payments.pending} pendentes
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded text-center">
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold">{stats.payments.total}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="text-green-700">Sync</div>
                    <div className="font-semibold text-green-600">
                      {stats.payments.synced}
                    </div>
                  </div>
                  {stats.payments.errors > 0 && (
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="text-red-700">Erros</div>
                      <div className="font-semibold text-red-600">
                        {stats.payments.errors}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="p-4 space-y-3">
          {/* Botão de sincronização */}
          <Button
            onClick={handleSync}
            disabled={isSyncing || !online}
            className="w-full"
            variant={online ? 'default' : 'secondary'}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : !online ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Sem Conexão
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Agora
              </>
            )}
          </Button>

          {/* Opção de auto-sync */}
          <label className="flex items-center justify-between text-sm cursor-pointer">
            <span className="text-gray-600">Sincronização automática</span>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Status da conexão */}
          <div className={`
            text-xs text-center py-2 rounded
            ${online ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}
          `}>
            {online ? '🌐 Online' : '📡 Offline'}
          </div>
        </div>
      </div>
    </div>
  );
}

