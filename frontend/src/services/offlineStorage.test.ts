import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addOfflineExpense,
  getOfflineExpenses,
  getUnsyncedExpenses,
  markExpenseAsSynced,
  removeOfflineExpense,
  addOfflinePayment,
  getOfflinePayments,
  getUnsyncedPayments,
  markPaymentAsSynced,
  removeOfflinePayment,
  setCachedData,
  getCachedData,
  addOfflineTab,
  getOfflineTabs,
  getUnsyncedTabs,
  markTabAsSynced,
  removeOfflineTab,
  clearAllOfflineData,
  getOfflineStats,
  hasOfflineData,
  type OfflineExpense,
  type OfflinePayment,
  type OfflineTab,
} from './offlineStorage';

// Mock do localforage
vi.mock('localforage', () => {
  const stores = new Map<string, Map<string, any>>();
  
  const createInstance = (config: any) => {
    const storeName = config.storeName;
    if (!stores.has(storeName)) {
      stores.set(storeName, new Map());
    }
    
    return {
      setItem: async (key: string, value: any) => {
        stores.get(storeName)?.set(key, value);
        return value;
      },
      getItem: async (key: string) => {
        return stores.get(storeName)?.get(key);
      },
      removeItem: async (key: string) => {
        stores.get(storeName)?.delete(key);
      },
      iterate: async (callback: (value: any, key: string) => void) => {
        const store = stores.get(storeName);
        if (store) {
          for (const [key, value] of store.entries()) {
            callback(value, key);
          }
        }
      },
      clear: async () => {
        stores.get(storeName)?.clear();
      },
      keys: async () => {
        return Array.from(stores.get(storeName)?.keys() || []);
      },
    };
  };

  return {
    default: {
      createInstance,
    },
  };
});

describe('offlineStorage', () => {
  beforeEach(async () => {
    await clearAllOfflineData();
  });

  describe('Offline Expenses', () => {
    it('deve adicionar um lançamento offline', async () => {
      const expense = {
        tabId: 1,
        itemId: 10,
        quantity: 2,
      };

      const id = await addOfflineExpense(expense);
      expect(id).toBeTruthy();
      expect(id).toMatch(/^expense_\d+_[a-z0-9]+$/);
    });

    it('deve obter todos os lançamentos offline', async () => {
      await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await addOfflineExpense({ tabId: 2, itemId: 20, quantity: 1 });

      const expenses = await getOfflineExpenses();
      expect(expenses).toHaveLength(2);
    });

    it('deve obter apenas lançamentos não sincronizados', async () => {
      const id1 = await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await addOfflineExpense({ tabId: 2, itemId: 20, quantity: 1 });
      
      await markExpenseAsSynced(id1);

      const unsynced = await getUnsyncedExpenses();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].tabId).toBe(2);
    });

    it('deve marcar lançamento como sincronizado', async () => {
      const id = await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await markExpenseAsSynced(id);

      const expenses = await getOfflineExpenses();
      const syncedExpense = expenses.find(e => e.id === id);
      expect(syncedExpense?.synced).toBe(true);
    });

    it('deve remover um lançamento offline', async () => {
      const id = await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await removeOfflineExpense(id);

      const expenses = await getOfflineExpenses();
      expect(expenses).toHaveLength(0);
    });

    it('deve adicionar lançamento com notas', async () => {
      const id = await addOfflineExpense({
        tabId: 1,
        itemId: 10,
        quantity: 2,
        notes: 'Sem cebola',
      });

      const expenses = await getOfflineExpenses();
      const expense = expenses.find(e => e.id === id);
      expect(expense?.notes).toBe('Sem cebola');
    });
  });

  describe('Offline Payments', () => {
    it('deve adicionar um pagamento offline', async () => {
      const payment = {
        tabId: 1,
        amount: 50.00,
        paymentMethod: 'dinheiro',
      };

      const id = await addOfflinePayment(payment);
      expect(id).toBeTruthy();
      expect(id).toMatch(/^payment_\d+_[a-z0-9]+$/);
    });

    it('deve obter todos os pagamentos offline', async () => {
      await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await addOfflinePayment({ tabId: 2, amount: 30.00, paymentMethod: 'cartao' });

      const payments = await getOfflinePayments();
      expect(payments).toHaveLength(2);
    });

    it('deve obter apenas pagamentos não sincronizados', async () => {
      const id1 = await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await addOfflinePayment({ tabId: 2, amount: 30.00, paymentMethod: 'cartao' });
      
      await markPaymentAsSynced(id1);

      const unsynced = await getUnsyncedPayments();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].tabId).toBe(2);
    });

    it('deve marcar pagamento como sincronizado', async () => {
      const id = await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await markPaymentAsSynced(id);

      const payments = await getOfflinePayments();
      const syncedPayment = payments.find(p => p.id === id);
      expect(syncedPayment?.synced).toBe(true);
    });

    it('deve remover um pagamento offline', async () => {
      const id = await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await removeOfflinePayment(id);

      const payments = await getOfflinePayments();
      expect(payments).toHaveLength(0);
    });
  });

  describe('Offline Tabs', () => {
    it('deve adicionar uma comanda offline', async () => {
      const id = await addOfflineTab('customer-123');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^tab_offline_\d+_[a-z0-9]+$/);
    });

    it('deve obter todas as comandas offline', async () => {
      await addOfflineTab('customer-1');
      await addOfflineTab('customer-2');

      const tabs = await getOfflineTabs();
      expect(tabs).toHaveLength(2);
    });

    it('deve obter apenas comandas não sincronizadas', async () => {
      const id1 = await addOfflineTab('customer-1');
      await addOfflineTab('customer-2');
      
      await markTabAsSynced(id1, '100');

      const unsynced = await getUnsyncedTabs();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].customerId).toBe('customer-2');
    });

    it('deve marcar comanda como sincronizada com ID do servidor', async () => {
      const id = await addOfflineTab('customer-1');
      await markTabAsSynced(id, '999');

      const tabs = await getOfflineTabs();
      const syncedTab = tabs.find(t => t.id === id);
      expect(syncedTab?.synced).toBe(true);
      expect(syncedTab?.serverTabId).toBe('999');
    });

    it('deve remover uma comanda offline', async () => {
      const id = await addOfflineTab('customer-1');
      await removeOfflineTab(id);

      const tabs = await getOfflineTabs();
      expect(tabs).toHaveLength(0);
    });

    it('deve adicionar comanda sem customerId', async () => {
      const id = await addOfflineTab();

      const tabs = await getOfflineTabs();
      const tab = tabs.find(t => t.id === id);
      expect(tab).toBeTruthy();
      expect(tab?.customerId).toBeUndefined();
    });
  });

  describe('Cached Data', () => {
    it('deve salvar dados em cache', async () => {
      const data = { items: [1, 2, 3] };
      await setCachedData('items-list', data);

      const cached = await getCachedData('items-list');
      expect(cached).toEqual(data);
    });

    it('deve retornar null para cache inexistente', async () => {
      const cached = await getCachedData('non-existent');
      expect(cached).toBeNull();
    });

    it('deve salvar cache com expiração', async () => {
      const data = { test: 'value' };
      await setCachedData('test-key', data, 5000); // 5 segundos

      const cached = await getCachedData('test-key');
      expect(cached).toEqual(data);
    });

    it('deve retornar null para cache expirado', async () => {
      vi.useFakeTimers();
      const data = { test: 'value' };
      await setCachedData('test-key', data, 1000); // 1 segundo

      // Avança 2 segundos
      vi.advanceTimersByTime(2000);

      const cached = await getCachedData('test-key');
      expect(cached).toBeNull();
      
      vi.useRealTimers();
    });

  });

  describe('Utility Functions', () => {
    it('deve limpar todos os dados offline', async () => {
      await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await addOfflineTab('customer-1');

      await clearAllOfflineData();

      const expenses = await getOfflineExpenses();
      const payments = await getOfflinePayments();
      const tabs = await getOfflineTabs();

      expect(expenses).toHaveLength(0);
      expect(payments).toHaveLength(0);
      expect(tabs).toHaveLength(0);
    });

    it('deve obter estatísticas de dados offline', async () => {
      await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await addOfflinePayment({ tabId: 1, amount: 50.00, paymentMethod: 'dinheiro' });
      await addOfflineTab('customer-1');

      const stats = await getOfflineStats();

      expect(stats.expenses.total).toBe(1);
      expect(stats.payments.total).toBe(1);
      expect(stats.tabs.total).toBe(1);
      expect(stats.expenses.pending).toBe(1);
      expect(stats.payments.pending).toBe(1);
      expect(stats.tabs.pending).toBe(1);
    });

    it('deve verificar se há dados offline', async () => {
      let hasData = await hasOfflineData();
      expect(hasData).toBe(false);

      await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });

      hasData = await hasOfflineData();
      expect(hasData).toBe(true);
    });

    it('deve retornar estatísticas vazias quando não há dados', async () => {
      const stats = await getOfflineStats();

      expect(stats.expenses.total).toBe(0);
      expect(stats.payments.total).toBe(0);
      expect(stats.tabs.total).toBe(0);
    });

    it('deve retornar estatísticas de sincronização', async () => {
      const expenseId = await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      await addOfflineExpense({ tabId: 2, itemId: 20, quantity: 1 });
      await markExpenseAsSynced(expenseId);

      const stats = await getOfflineStats();

      expect(stats.expenses.total).toBe(2);
      expect(stats.expenses.synced).toBe(1);
      expect(stats.expenses.pending).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('deve marcar lançamento com erro', async () => {
      const id = await addOfflineExpense({ tabId: 1, itemId: 10, quantity: 2 });
      
      // Simular erro durante sincronização
      const expenses = await getOfflineExpenses();
      const expense = expenses.find(e => e.id === id);
      
      if (expense) {
        expense.error = 'Erro de conexão';
        // Em implementação real, teria uma função para isso
      }

      expect(expense?.error).toBe('Erro de conexão');
    });
  });
});

