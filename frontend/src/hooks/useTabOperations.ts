import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { tabsApi } from '@/services/api';
import { 
  addOfflineExpense, 
  addOfflinePayment, 
  isOnline,
  setCachedData,
  getCachedData 
} from '@/services/offlineStorage';
import type { AddPaymentDto } from '@/types';

interface UseTabOperationsProps {
  tabId: string;
  onSuccess?: () => void;
}

export function useTabOperations({ tabId, onSuccess }: UseTabOperationsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  /**
   * Adiciona um item à comanda com suporte offline
   */
  const addItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      if (isOnline()) {
        // Online: tenta adicionar diretamente
        try {
          await tabsApi.addItem(tabId, { itemId, qty: quantity });
          toast({
            title: "✅ Item adicionado",
            description: "Item adicionado à comanda com sucesso",
          });
          onSuccess?.();
          return { success: true, offline: false };
        } catch (error) {
          // Se falhar online, tenta salvar offline como fallback
          console.error('Erro ao adicionar item online, salvando offline:', error);
          // Suporta tanto IDs numéricos quanto strings (tabs offline)
          const tabIdValue = tabId.startsWith('tab_offline_') ? tabId : parseInt(tabId);
          await addOfflineExpense({
            tabId: tabIdValue,
            itemId: parseInt(itemId),
            quantity,
          });
          toast({
            title: "⚠️ Erro de conexão",
            description: "Item salvo offline e será sincronizado depois",
          });
          onSuccess?.();
          return { success: true, offline: true };
        }
      } else {
        // Offline: salva diretamente
        // Suporta tanto IDs numéricos quanto strings (tabs offline)
        const tabIdValue = tabId.startsWith('tab_offline_') ? tabId : parseInt(tabId);
        await addOfflineExpense({
          tabId: tabIdValue,
          itemId: parseInt(itemId),
          quantity,
        });
        toast({
          title: "💾 Item salvo offline",
          description: "Será sincronizado quando voltar online",
        });
        onSuccess?.();
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o item",
        variant: "destructive",
      });
      return { success: false, offline: false };
    } finally {
      setLoading(false);
    }
  }, [tabId, toast, onSuccess]);

  /**
   * Remove um item da comanda (apenas online)
   */
  const removeItem = useCallback(async (tabItemId: string) => {
    if (!isOnline()) {
      toast({
        title: "⚠️ Offline",
        description: "Não é possível remover itens offline",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    try {
      await tabsApi.removeItem(tabId, tabItemId);
      toast({
        title: "✅ Item removido",
        description: "Item removido da comanda",
      });
      onSuccess?.();
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [tabId, toast, onSuccess]);

  /**
   * Adiciona um pagamento com suporte offline
   */
  const addPayment = useCallback(async (paymentData: AddPaymentDto) => {
    setLoading(true);
    try {
      if (isOnline()) {
        // Online: tenta processar diretamente
        try {
          await tabsApi.addPayment(tabId, paymentData);
          toast({
            title: "✅ Pagamento registrado",
            description: `Pagamento de R$ ${parseFloat(paymentData.amount).toFixed(2)} processado`,
          });
          onSuccess?.();
          return { success: true, offline: false };
        } catch (error) {
          // Se falhar online, tenta salvar offline como fallback
          console.error('Erro ao processar pagamento online, salvando offline:', error);
          // Suporta tanto IDs numéricos quanto strings (tabs offline)
          const tabIdValue = tabId.startsWith('tab_offline_') ? tabId : parseInt(tabId);
          await addOfflinePayment({
            tabId: tabIdValue,
            amount: parseFloat(paymentData.amount),
            paymentMethod: paymentData.method,
          });
          toast({
            title: "⚠️ Erro de conexão",
            description: "Pagamento salvo offline e será processado depois",
          });
          onSuccess?.();
          return { success: true, offline: true };
        }
      } else {
        // Offline: salva diretamente
        // Suporta tanto IDs numéricos quanto strings (tabs offline)
        const tabIdValue = tabId.startsWith('tab_offline_') ? tabId : parseInt(tabId);
        await addOfflinePayment({
          tabId: tabIdValue,
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.method,
        });
        toast({
          title: "💾 Pagamento salvo offline",
          description: "Será processado quando voltar online",
        });
        onSuccess?.();
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive",
      });
      return { success: false, offline: false };
    } finally {
      setLoading(false);
    }
  }, [tabId, toast, onSuccess]);

  /**
   * Carrega dados da comanda com cache offline
   */
  const loadTabWithCache = useCallback(async () => {
    const cacheKey = `tab_${tabId}`;
    
    try {
      if (isOnline()) {
        // Tenta carregar do servidor
        const tabData = await tabsApi.getById(tabId);
        // Salva no cache para uso offline (1 hora de validade)
        await setCachedData(cacheKey, tabData, 60 * 60 * 1000);
        return { data: tabData, fromCache: false };
      } else {
        // Carrega do cache
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          toast({
            title: "📱 Modo Offline",
            description: "Exibindo dados salvos localmente",
          });
          return { data: cachedData, fromCache: true };
        } else {
          toast({
            title: "⚠️ Sem dados offline",
            description: "Não há dados salvos para visualização offline",
            variant: "destructive",
          });
          return { data: null, fromCache: false };
        }
      }
    } catch (error) {
      // Se falhar online, tenta cache
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        toast({
          title: "⚠️ Erro de conexão",
          description: "Exibindo dados do cache local",
        });
        return { data: cachedData, fromCache: true };
      }
      throw error;
    }
  }, [tabId, toast]);

  return {
    addItem,
    removeItem,
    addPayment,
    loadTabWithCache,
    loading,
    isOnline: isOnline(),
  };
}

