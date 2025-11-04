# 🔌 Exemplo de Integração Offline - BarTab

## Como Integrar o Armazenamento Offline nos Componentes Existentes

Este documento mostra como adicionar funcionalidade offline aos componentes existentes do BarTab.

## 📝 Exemplo 1: Adicionar Lançamento com Suporte Offline

### Antes (sem offline):

```typescript
// frontend/src/pages/TabDetail.tsx
async function handleAddExpense(itemId: number, quantity: number) {
  try {
    await api.post(`/tabs/${tabId}/expense`, {
      itemId,
      quantity
    });
    
    toast({
      title: "Sucesso",
      description: "Lançamento adicionado"
    });
    
    refreshTab();
  } catch (error) {
    toast({
      title: "Erro",
      description: "Falha ao adicionar lançamento",
      variant: "destructive"
    });
  }
}
```

### Depois (com offline):

```typescript
// frontend/src/pages/TabDetail.tsx
import { addOfflineExpense, isOnline } from '@/services/offlineStorage';

async function handleAddExpense(itemId: number, quantity: number, notes?: string) {
  try {
    if (isOnline()) {
      // Tenta adicionar online
      await api.post(`/tabs/${tabId}/expense`, {
        itemId,
        quantity,
        notes
      });
      
      toast({
        title: "✅ Sucesso",
        description: "Lançamento adicionado"
      });
    } else {
      // Salva offline para sincronizar depois
      await addOfflineExpense({
        tabId: parseInt(tabId),
        itemId,
        quantity,
        notes
      });
      
      toast({
        title: "💾 Salvo Offline",
        description: "Será sincronizado quando voltar online",
        variant: "default"
      });
    }
    
    refreshTab();
  } catch (error) {
    // Se falhar online, tenta salvar offline como fallback
    if (navigator.onLine) {
      try {
        await addOfflineExpense({
          tabId: parseInt(tabId),
          itemId,
          quantity,
          notes
        });
        
        toast({
          title: "⚠️ Erro de Conexão",
          description: "Lançamento salvo offline para sincronização posterior",
        });
      } catch (offlineError) {
        toast({
          title: "❌ Erro",
          description: "Não foi possível salvar o lançamento",
          variant: "destructive"
        });
      }
    }
  }
}
```

## 💰 Exemplo 2: Pagamento com Suporte Offline

```typescript
// frontend/src/components/PaymentModal.tsx
import { addOfflinePayment, isOnline } from '@/services/offlineStorage';

async function handlePayment(amount: number, method: string) {
  try {
    if (isOnline()) {
      await api.post(`/tabs/${tabId}/payment`, {
        amount,
        paymentMethod: method
      });
      
      toast({
        title: "✅ Pagamento Registrado",
        description: `R$ ${amount.toFixed(2)} recebido`
      });
    } else {
      await addOfflinePayment({
        tabId: parseInt(tabId),
        amount,
        paymentMethod: method
      });
      
      toast({
        title: "💾 Pagamento Salvo Offline",
        description: "Será processado quando voltar online"
      });
    }
    
    onSuccess();
  } catch (error) {
    // Fallback offline em caso de erro
    try {
      await addOfflinePayment({
        tabId: parseInt(tabId),
        amount,
        paymentMethod: method
      });
      
      toast({
        title: "⚠️ Salvo Offline",
        description: "Pagamento registrado localmente"
      });
    } catch (offlineError) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive"
      });
    }
  }
}
```

## 🔄 Exemplo 3: Componente de Sincronização Completo

```typescript
// frontend/src/components/SyncManager.tsx
import { useEffect, useState } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import type { OfflineExpense, OfflinePayment } from '@/services/offlineStorage';

export function SyncManager() {
  const { toast } = useToast();
  const { 
    online, 
    hasPendingData, 
    stats,
    syncOfflineData,
    isSyncing 
  } = useOfflineStorage();
  
  const [autoSync, setAutoSync] = useState(true);

  // Sincronização automática quando voltar online
  useEffect(() => {
    if (online && hasPendingData && autoSync && !isSyncing) {
      handleSync();
    }
  }, [online, hasPendingData, autoSync]);

  async function handleSync() {
    const result = await syncOfflineData(
      // Função para sincronizar lançamentos
      async (expense: OfflineExpense) => {
        await api.post(`/tabs/${expense.tabId}/expense`, {
          itemId: expense.itemId,
          quantity: expense.quantity,
          notes: expense.notes
        });
      },
      // Função para sincronizar pagamentos
      async (payment: OfflinePayment) => {
        await api.post(`/tabs/${payment.tabId}/payment`, {
          amount: payment.amount,
          paymentMethod: payment.paymentMethod
        });
      }
    );

    if (result.success) {
      toast({
        title: "✅ Sincronização Concluída",
        description: result.message
      });
    } else {
      toast({
        title: "❌ Erro na Sincronização",
        description: result.message,
        variant: "destructive"
      });
    }
  }

  if (!hasPendingData) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Dados Pendentes</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
          />
          Auto-sync
        </label>
      </div>
      
      {stats && (
        <div className="text-sm text-gray-600 mb-3">
          <p>Lançamentos: {stats.expenses.pending}</p>
          <p>Pagamentos: {stats.payments.pending}</p>
        </div>
      )}
      
      <button
        onClick={handleSync}
        disabled={isSyncing || !online}
        className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-300"
      >
        {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
      </button>
    </div>
  );
}
```

## 📊 Exemplo 4: Cache de Dados para Visualização Offline

```typescript
// frontend/src/pages/TabDetail.tsx
import { setCachedData, getCachedData } from '@/services/offlineStorage';

async function loadTabDetails(tabId: string) {
  try {
    // Tenta carregar do servidor
    const response = await api.get(`/tabs/${tabId}`);
    const data = response.data;
    
    // Salva no cache para uso offline
    await setCachedData(`tab_${tabId}`, data, 60 * 60 * 1000); // 1 hora
    
    setTabData(data);
  } catch (error) {
    // Se falhar, tenta carregar do cache
    const cached = await getCachedData(`tab_${tabId}`);
    
    if (cached) {
      setTabData(cached);
      toast({
        title: "📱 Modo Offline",
        description: "Exibindo dados salvos localmente"
      });
    } else {
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    }
  }
}
```

## 🎨 Exemplo 5: Indicador Visual de Status Offline

```typescript
// frontend/src/components/ExpenseItem.tsx
import { WifiOff } from 'lucide-react';

function ExpenseItem({ expense, isOffline = false }) {
  return (
    <div className={`
      p-4 rounded-lg 
      ${isOffline ? 'bg-orange-50 border-l-4 border-orange-500' : 'bg-white'}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{expense.itemName}</h4>
          <p className="text-sm text-gray-600">
            Qtd: {expense.quantity} × R$ {expense.price.toFixed(2)}
          </p>
        </div>
        
        {isOffline && (
          <div className="flex items-center gap-2 text-orange-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Pendente</span>
          </div>
        )}
        
        <div className="text-right">
          <p className="font-bold">
            R$ {(expense.quantity * expense.price).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 🔍 Exemplo 6: Hook Personalizado para Operações Offline

```typescript
// frontend/src/hooks/useTabOperations.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { addOfflineExpense, addOfflinePayment, isOnline } from '@/services/offlineStorage';

export function useTabOperations(tabId: number) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function addExpense(itemId: number, quantity: number, notes?: string) {
    setLoading(true);
    try {
      if (isOnline()) {
        await api.post(`/tabs/${tabId}/expense`, { itemId, quantity, notes });
        toast({ title: "✅ Lançamento adicionado" });
      } else {
        await addOfflineExpense({ tabId, itemId, quantity, notes });
        toast({ 
          title: "💾 Salvo offline",
          description: "Sincronizará quando voltar online" 
        });
      }
      return { success: true };
    } catch (error) {
      // Fallback offline
      try {
        await addOfflineExpense({ tabId, itemId, quantity, notes });
        toast({ 
          title: "⚠️ Erro de conexão",
          description: "Lançamento salvo offline" 
        });
        return { success: true, offline: true };
      } catch (offlineError) {
        toast({ 
          title: "❌ Erro",
          description: "Não foi possível salvar",
          variant: "destructive" 
        });
        return { success: false };
      }
    } finally {
      setLoading(false);
    }
  }

  async function addPayment(amount: number, method: string) {
    setLoading(true);
    try {
      if (isOnline()) {
        await api.post(`/tabs/${tabId}/payment`, { amount, paymentMethod: method });
        toast({ title: "✅ Pagamento registrado" });
      } else {
        await addOfflinePayment({ tabId, amount, paymentMethod: method });
        toast({ 
          title: "💾 Pagamento salvo offline",
          description: "Será processado quando voltar online" 
        });
      }
      return { success: true };
    } catch (error) {
      // Fallback offline
      try {
        await addOfflinePayment({ tabId, amount, paymentMethod: method });
        toast({ 
          title: "⚠️ Salvo offline",
          description: "Pagamento será sincronizado depois" 
        });
        return { success: true, offline: true };
      } catch (offlineError) {
        toast({ 
          title: "❌ Erro",
          description: "Não foi possível registrar pagamento",
          variant: "destructive" 
        });
        return { success: false };
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    addExpense,
    addPayment,
    loading
  };
}
```

## 📱 Exemplo 7: Tela de Dados Offline

```typescript
// frontend/src/pages/OfflineData.tsx
import { useEffect, useState } from 'react';
import { 
  getOfflineExpenses, 
  getOfflinePayments,
  removeOfflineExpense,
  removeOfflinePayment,
  type OfflineExpense,
  type OfflinePayment
} from '@/services/offlineStorage';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export function OfflineDataPage() {
  const [expenses, setExpenses] = useState<OfflineExpense[]>([]);
  const [payments, setPayments] = useState<OfflinePayment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const exp = await getOfflineExpenses();
    const pay = await getOfflinePayments();
    setExpenses(exp);
    setPayments(pay);
  }

  async function handleDelete(type: 'expense' | 'payment', id: string) {
    if (confirm('Remover este item offline?')) {
      if (type === 'expense') {
        await removeOfflineExpense(id);
      } else {
        await removeOfflinePayment(id);
      }
      loadData();
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dados Offline</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Lançamentos ({expenses.length})
        </h2>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className={`
                p-4 rounded-lg border flex items-center justify-between
                ${expense.synced ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
                ${expense.error ? 'bg-red-50 border-red-200' : ''}
              `}
            >
              <div className="flex-1">
                <p className="font-medium">
                  Comanda #{expense.tabId} - Item #{expense.itemId}
                </p>
                <p className="text-sm text-gray-600">
                  Quantidade: {expense.quantity}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(expense.timestamp).toLocaleString('pt-BR')}
                </p>
                {expense.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Erro: {expense.error}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {expense.synced ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : expense.error ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                
                <button
                  onClick={() => handleDelete('expense', expense.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Pagamentos ({payments.length})
        </h2>
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className={`
                p-4 rounded-lg border flex items-center justify-between
                ${payment.synced ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
              `}
            >
              <div className="flex-1">
                <p className="font-medium">
                  Comanda #{payment.tabId}
                </p>
                <p className="text-sm text-gray-600">
                  R$ {payment.amount.toFixed(2)} - {payment.paymentMethod}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(payment.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {payment.synced ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                
                <button
                  onClick={() => handleDelete('payment', payment.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

## 🚀 Próximos Passos

1. **Integrar nos componentes existentes**:
   - `TabDetail.tsx` - adicionar lançamentos offline
   - `PaymentModal.tsx` - adicionar pagamentos offline
   - `Layout.tsx` - adicionar SyncManager

2. **Testar fluxo completo**:
   - Desconectar internet
   - Adicionar lançamentos
   - Adicionar pagamentos
   - Reconectar
   - Verificar sincronização

3. **Adicionar rota de dados offline** (opcional):
   - Criar página `/offline-data`
   - Permitir visualização e gerenciamento manual

4. **Melhorias futuras**:
   - Background Sync API
   - Notificações de sincronização
   - Resolução de conflitos
   - Retry automático com exponential backoff

