import { useState, useEffect, useCallback } from 'react';
import {
  hasOfflineData,
  getOfflineStats,
  isOnline,
  addNetworkListener,
  getUnsyncedExpenses,
  getUnsyncedPayments,
  markExpenseAsSynced,
  markPaymentAsSynced,
  markExpenseAsError,
  clearSyncedExpenses,
  clearSyncedPayments,
  type OfflineExpense,
  type OfflinePayment,
} from '@/services/offlineStorage';

export function useOfflineStorage() {
  const [online, setOnline] = useState(isOnline());
  const [hasPendingData, setHasPendingData] = useState(false);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOfflineStats>> | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Atualiza o status de online/offline
  useEffect(() => {
    const cleanup = addNetworkListener(
      () => {
        console.log('🌐 Conexão restaurada');
        setOnline(true);
      },
      () => {
        console.log('📡 Conexão perdida - modo offline');
        setOnline(false);
      }
    );

    return cleanup;
  }, []);

  // Verifica dados pendentes
  const checkPendingData = useCallback(async () => {
    const pending = await hasOfflineData();
    setHasPendingData(pending);
    
    const offlineStats = await getOfflineStats();
    setStats(offlineStats);
    
    return pending;
  }, []);

  // Verifica dados pendentes ao montar e quando voltar online
  useEffect(() => {
    checkPendingData();
    
    if (online) {
      // Quando voltar online, verifica se há dados para sincronizar
      checkPendingData().then(hasPending => {
        if (hasPending) {
          console.log('📤 Dados offline detectados, pronto para sincronizar');
        }
      });
    }
  }, [online, checkPendingData]);

  // Função para sincronizar dados offline com o servidor
  const syncOfflineData = useCallback(async (
    syncExpensesFn: (expense: OfflineExpense) => Promise<void>,
    syncPaymentsFn: (payment: OfflinePayment) => Promise<void>
  ) => {
    if (!online) {
      console.warn('⚠️ Não é possível sincronizar offline');
      return { success: false, message: 'Sem conexão com a internet' };
    }

    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Sincronizar lançamentos
      const expenses = await getUnsyncedExpenses();
      console.log(`📤 Sincronizando ${expenses.length} lançamentos...`);
      
      for (const expense of expenses) {
        try {
          await syncExpensesFn(expense);
          await markExpenseAsSynced(expense.id);
          successCount++;
        } catch (error) {
          console.error('Erro ao sincronizar lançamento:', error);
          await markExpenseAsError(expense.id, error instanceof Error ? error.message : 'Erro desconhecido');
          errorCount++;
        }
      }

      // Sincronizar pagamentos
      const payments = await getUnsyncedPayments();
      console.log(`📤 Sincronizando ${payments.length} pagamentos...`);
      
      for (const payment of payments) {
        try {
          await syncPaymentsFn(payment);
          await markPaymentAsSynced(payment.id);
          successCount++;
        } catch (error) {
          console.error('Erro ao sincronizar pagamento:', error);
          errorCount++;
        }
      }

      // Limpar dados sincronizados
      await clearSyncedExpenses();
      await clearSyncedPayments();

      // Atualizar status
      await checkPendingData();

      const message = `Sincronização concluída: ${successCount} itens sincronizados${errorCount > 0 ? `, ${errorCount} com erro` : ''}`;
      console.log(`✅ ${message}`);

      return {
        success: true,
        message,
        successCount,
        errorCount,
      };
    } catch (error) {
      console.error('Erro durante sincronização:', error);
      return {
        success: false,
        message: 'Erro durante a sincronização',
        error,
      };
    } finally {
      setIsSyncing(false);
    }
  }, [online, checkPendingData]);

  return {
    online,
    hasPendingData,
    stats,
    isSyncing,
    checkPendingData,
    syncOfflineData,
  };
}

