import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineIndicatorProps {
  onSyncRequest?: () => void;
}

export function OfflineIndicator({ onSyncRequest }: OfflineIndicatorProps) {
  const { online, hasPendingData, stats, isSyncing } = useOfflineStorage();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  // Se está online e não tem dados pendentes, não mostra nada
  if (online && !hasPendingData && !isSyncing) {
    return null;
  }

  const handleSyncClick = () => {
    if (onSyncRequest) {
      onSyncRequest();
    } else {
      toast({
        title: 'Sincronização',
        description: 'A sincronização automática será implementada em breve',
      });
    }
  };

  return (
    <div className="fixed top-16 right-4 z-40">
      <div className={`
        rounded-lg shadow-lg p-3 transition-all
        ${online ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}
      `}>
        <div className="flex items-center gap-3">
          {/* Ícone de status */}
          {online ? (
            hasPendingData ? (
              <Cloud className="w-5 h-5 text-blue-600" />
            ) : (
              <Wifi className="w-5 h-5 text-green-600" />
            )
          ) : (
            <CloudOff className="w-5 h-5 text-orange-600" />
          )}

          {/* Mensagem de status */}
          <div className="flex-1">
            {!online && (
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Modo Offline
                </span>
              </div>
            )}
            
            {online && hasPendingData && !isSyncing && (
              <div className="text-sm font-medium text-blue-900">
                Dados pendentes para sincronizar
              </div>
            )}
            
            {isSyncing && (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-blue-900">
                  Sincronizando...
                </span>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          {online && hasPendingData && !isSyncing && (
            <Button
              onClick={handleSyncClick}
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Sincronizar
            </Button>
          )}

          {/* Botão de detalhes */}
          {stats && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showDetails ? '▲' : '▼'}
            </button>
          )}
        </div>

        {/* Detalhes expandidos */}
        {showDetails && stats && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {stats.tabs && stats.tabs.total > 0 && (
              <div className="text-xs text-gray-600">
                <div className="font-semibold mb-1">Contas:</div>
                <div className="pl-2 space-y-0.5">
                  <div>Total: {stats.tabs.total}</div>
                  <div>Pendentes: {stats.tabs.pending}</div>
                  <div>Sincronizadas: {stats.tabs.synced}</div>
                  {stats.tabs.errors > 0 && (
                    <div className="text-red-600">Com erro: {stats.tabs.errors}</div>
                  )}
                </div>
              </div>
            )}
            
            {stats.expenses.total > 0 && (
              <div className="text-xs text-gray-600">
                <div className="font-semibold mb-1">Lançamentos:</div>
                <div className="pl-2 space-y-0.5">
                  <div>Total: {stats.expenses.total}</div>
                  <div>Pendentes: {stats.expenses.pending}</div>
                  <div>Sincronizados: {stats.expenses.synced}</div>
                  {stats.expenses.errors > 0 && (
                    <div className="text-red-600">Com erro: {stats.expenses.errors}</div>
                  )}
                </div>
              </div>
            )}
            
            {stats.payments.total > 0 && (
              <div className="text-xs text-gray-600">
                <div className="font-semibold mb-1">Pagamentos:</div>
                <div className="pl-2 space-y-0.5">
                  <div>Total: {stats.payments.total}</div>
                  <div>Pendentes: {stats.payments.pending}</div>
                  <div>Sincronizados: {stats.payments.synced}</div>
                  {stats.payments.errors > 0 && (
                    <div className="text-red-600">Com erro: {stats.payments.errors}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

