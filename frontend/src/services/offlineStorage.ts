import localforage from 'localforage';

// Configuração do LocalForage para múltiplas stores
const offlineExpensesStore = localforage.createInstance({
  name: 'bartab',
  storeName: 'offline_expenses',
  description: 'Armazena lançamentos de consumo offline para sincronização posterior',
});

const offlinePaymentsStore = localforage.createInstance({
  name: 'bartab',
  storeName: 'offline_payments',
  description: 'Armazena pagamentos offline para sincronização posterior',
});

const cachedDataStore = localforage.createInstance({
  name: 'bartab',
  storeName: 'cached_data',
  description: 'Cache de dados para uso offline',
});

const offlineTabsStore = localforage.createInstance({
  name: 'bartab',
  storeName: 'offline_tabs',
  description: 'Armazena comandas criadas offline para sincronização posterior',
});

// Tipos
export interface OfflineTab {
  id: string;
  customerId?: string;
  timestamp: number;
  synced: boolean;
  error?: string;
  serverTabId?: string; // ID da tab no servidor após sincronização
}

export interface OfflineExpense {
  id: string;
  tabId: number | string; // Pode ser ID do servidor ou ID offline temporário
  itemId: number;
  quantity: number;
  notes?: string;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export interface OfflinePayment {
  id: string;
  tabId: number | string; // Pode ser ID do servidor ou ID offline temporário
  amount: number;
  paymentMethod: string;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresIn?: number; // em milissegundos
}

// ============= OFFLINE EXPENSES =============

/**
 * Adiciona um lançamento de consumo à fila offline
 */
export async function addOfflineExpense(expense: Omit<OfflineExpense, 'id' | 'timestamp' | 'synced'>): Promise<string> {
  const id = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const offlineExpense: OfflineExpense = {
    ...expense,
    id,
    timestamp: Date.now(),
    synced: false,
  };
  
  await offlineExpensesStore.setItem(id, offlineExpense);
  console.log('✅ Lançamento salvo offline:', offlineExpense);
  return id;
}

/**
 * Obtém todos os lançamentos offline pendentes
 */
export async function getOfflineExpenses(): Promise<OfflineExpense[]> {
  const expenses: OfflineExpense[] = [];
  await offlineExpensesStore.iterate((value: OfflineExpense) => {
    expenses.push(value);
  });
  return expenses.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Obtém lançamentos offline não sincronizados
 */
export async function getUnsyncedExpenses(): Promise<OfflineExpense[]> {
  const expenses = await getOfflineExpenses();
  return expenses.filter(e => !e.synced);
}

/**
 * Marca um lançamento como sincronizado
 */
export async function markExpenseAsSynced(id: string): Promise<void> {
  const expense = await offlineExpensesStore.getItem<OfflineExpense>(id);
  if (expense) {
    expense.synced = true;
    await offlineExpensesStore.setItem(id, expense);
    console.log('✅ Lançamento sincronizado:', id);
  }
}

/**
 * Marca um lançamento com erro
 */
export async function markExpenseAsError(id: string, error: string): Promise<void> {
  const expense = await offlineExpensesStore.getItem<OfflineExpense>(id);
  if (expense) {
    expense.error = error;
    await offlineExpensesStore.setItem(id, expense);
    console.error('❌ Erro no lançamento:', id, error);
  }
}

/**
 * Remove um lançamento offline
 */
export async function removeOfflineExpense(id: string): Promise<void> {
  await offlineExpensesStore.removeItem(id);
  console.log('🗑️ Lançamento offline removido:', id);
}

/**
 * Limpa todos os lançamentos sincronizados
 */
export async function clearSyncedExpenses(): Promise<void> {
  const expenses = await getOfflineExpenses();
  const syncedExpenses = expenses.filter(e => e.synced);
  
  for (const expense of syncedExpenses) {
    await removeOfflineExpense(expense.id);
  }
  
  console.log(`🗑️ ${syncedExpenses.length} lançamentos sincronizados removidos`);
}

// ============= OFFLINE PAYMENTS =============

/**
 * Adiciona um pagamento à fila offline
 */
export async function addOfflinePayment(payment: Omit<OfflinePayment, 'id' | 'timestamp' | 'synced'>): Promise<string> {
  const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const offlinePayment: OfflinePayment = {
    ...payment,
    id,
    timestamp: Date.now(),
    synced: false,
  };
  
  await offlinePaymentsStore.setItem(id, offlinePayment);
  console.log('✅ Pagamento salvo offline:', offlinePayment);
  return id;
}

/**
 * Obtém todos os pagamentos offline pendentes
 */
export async function getOfflinePayments(): Promise<OfflinePayment[]> {
  const payments: OfflinePayment[] = [];
  await offlinePaymentsStore.iterate((value: OfflinePayment) => {
    payments.push(value);
  });
  return payments.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Obtém pagamentos offline não sincronizados
 */
export async function getUnsyncedPayments(): Promise<OfflinePayment[]> {
  const payments = await getOfflinePayments();
  return payments.filter(p => !p.synced);
}

/**
 * Marca um pagamento como sincronizado
 */
export async function markPaymentAsSynced(id: string): Promise<void> {
  const payment = await offlinePaymentsStore.getItem<OfflinePayment>(id);
  if (payment) {
    payment.synced = true;
    await offlinePaymentsStore.setItem(id, payment);
    console.log('✅ Pagamento sincronizado:', id);
  }
}

/**
 * Remove um pagamento offline
 */
export async function removeOfflinePayment(id: string): Promise<void> {
  await offlinePaymentsStore.removeItem(id);
  console.log('🗑️ Pagamento offline removido:', id);
}

/**
 * Limpa todos os pagamentos sincronizados
 */
export async function clearSyncedPayments(): Promise<void> {
  const payments = await getOfflinePayments();
  const syncedPayments = payments.filter(p => p.synced);
  
  for (const payment of syncedPayments) {
    await removeOfflinePayment(payment.id);
  }
  
  console.log(`🗑️ ${syncedPayments.length} pagamentos sincronizados removidos`);
}

// ============= OFFLINE TABS =============

/**
 * Cria uma nova comanda offline para sincronização posterior
 */
export async function addOfflineTab(customerId?: string): Promise<string> {
  const id = `tab_offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const offlineTab: OfflineTab = {
    id,
    customerId,
    timestamp: Date.now(),
    synced: false,
  };
  
  await offlineTabsStore.setItem(id, offlineTab);
  console.log('✅ Comanda criada offline:', offlineTab);
  return id;
}

/**
 * Obtém todas as comandas offline
 */
export async function getOfflineTabs(): Promise<OfflineTab[]> {
  const tabs: OfflineTab[] = [];
  await offlineTabsStore.iterate((value: OfflineTab) => {
    tabs.push(value);
  });
  return tabs.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Obtém comandas offline não sincronizadas
 */
export async function getUnsyncedTabs(): Promise<OfflineTab[]> {
  const tabs = await getOfflineTabs();
  return tabs.filter(t => !t.synced);
}

/**
 * Marca uma comanda como sincronizada e armazena o ID do servidor
 */
export async function markTabAsSynced(id: string, serverTabId: string): Promise<void> {
  const tab = await offlineTabsStore.getItem<OfflineTab>(id);
  if (tab) {
    tab.synced = true;
    tab.serverTabId = serverTabId;
    await offlineTabsStore.setItem(id, tab);
    console.log('✅ Comanda sincronizada:', id, '→', serverTabId);
  }
}

/**
 * Marca uma comanda com erro
 */
export async function markTabAsError(id: string, error: string): Promise<void> {
  const tab = await offlineTabsStore.getItem<OfflineTab>(id);
  if (tab) {
    tab.error = error;
    await offlineTabsStore.setItem(id, tab);
    console.error('❌ Erro na comanda:', id, error);
  }
}

/**
 * Remove uma comanda offline
 */
export async function removeOfflineTab(id: string): Promise<void> {
  await offlineTabsStore.removeItem(id);
  console.log('🗑️ Comanda offline removida:', id);
}

/**
 * Limpa todas as comandas sincronizadas
 */
export async function clearSyncedTabs(): Promise<void> {
  const tabs = await getOfflineTabs();
  const syncedTabs = tabs.filter(t => t.synced);
  
  for (const tab of syncedTabs) {
    await removeOfflineTab(tab.id);
  }
  
  console.log(`🗑️ ${syncedTabs.length} comandas sincronizadas removidas`);
}

/**
 * Atualiza IDs de itens/pagamentos quando uma tab offline é sincronizada
 */
export async function updateOfflineItemsTabId(offlineTabId: string, serverTabId: string): Promise<void> {
  // Atualizar expenses
  const expenses = await getOfflineExpenses();
  for (const expense of expenses) {
    if (expense.tabId === offlineTabId) {
      expense.tabId = parseInt(serverTabId);
      await offlineExpensesStore.setItem(expense.id, expense);
    }
  }
  
  // Atualizar payments
  const payments = await getOfflinePayments();
  for (const payment of payments) {
    if (payment.tabId === offlineTabId) {
      payment.tabId = parseInt(serverTabId);
      await offlinePaymentsStore.setItem(payment.id, payment);
    }
  }
  
  console.log(`🔄 IDs atualizados de ${offlineTabId} para ${serverTabId}`);
}

// ============= CACHED DATA =============

/**
 * Armazena dados em cache para uso offline
 */
export async function setCachedData(key: string, data: any, expiresIn?: number): Promise<void> {
  const cachedData: CachedData = {
    key,
    data,
    timestamp: Date.now(),
    expiresIn,
  };
  
  await cachedDataStore.setItem(key, cachedData);
  console.log('💾 Dados em cache salvos:', key);
}

/**
 * Recupera dados do cache
 */
export async function getCachedData<T = any>(key: string): Promise<T | null> {
  const cached = await cachedDataStore.getItem<CachedData>(key);
  
  if (!cached) {
    return null;
  }
  
  // Verifica se expirou
  if (cached.expiresIn && Date.now() - cached.timestamp > cached.expiresIn) {
    await cachedDataStore.removeItem(key);
    console.log('⏰ Cache expirado:', key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Remove dados do cache
 */
export async function removeCachedData(key: string): Promise<void> {
  await cachedDataStore.removeItem(key);
  console.log('🗑️ Cache removido:', key);
}

/**
 * Limpa todo o cache
 */
export async function clearAllCache(): Promise<void> {
  await cachedDataStore.clear();
  console.log('🗑️ Todo o cache foi limpo');
}

// ============= UTILITIES =============

/**
 * Verifica se há dados offline pendentes
 */
export async function hasOfflineData(): Promise<boolean> {
  const tabs = await getUnsyncedTabs();
  const expenses = await getUnsyncedExpenses();
  const payments = await getUnsyncedPayments();
  return tabs.length > 0 || expenses.length > 0 || payments.length > 0;
}

/**
 * Obtém estatísticas dos dados offline
 */
export async function getOfflineStats() {
  const tabs = await getOfflineTabs();
  const expenses = await getOfflineExpenses();
  const payments = await getOfflinePayments();
  
  return {
    tabs: {
      total: tabs.length,
      synced: tabs.filter(t => t.synced).length,
      pending: tabs.filter(t => !t.synced).length,
      errors: tabs.filter(t => t.error).length,
    },
    expenses: {
      total: expenses.length,
      synced: expenses.filter(e => e.synced).length,
      pending: expenses.filter(e => !e.synced).length,
      errors: expenses.filter(e => e.error).length,
    },
    payments: {
      total: payments.length,
      synced: payments.filter(p => p.synced).length,
      pending: payments.filter(p => !p.synced).length,
      errors: payments.filter(p => p.error).length,
    },
  };
}

/**
 * Limpa todos os dados offline (use com cuidado!)
 */
export async function clearAllOfflineData(): Promise<void> {
  await offlineTabsStore.clear();
  await offlineExpensesStore.clear();
  await offlinePaymentsStore.clear();
  await clearAllCache();
  console.log('🗑️ Todos os dados offline foram limpos');
}

/**
 * Verifica se o navegador está online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Adiciona listener para mudanças no status de rede
 */
export function addNetworkListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Retorna função de cleanup
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

