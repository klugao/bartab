import { useEffect, useState } from 'react';
import { 
  getOfflineExpenses, 
  getOfflinePayments,
  removeOfflineExpense,
  removeOfflinePayment,
  getOfflineStats,
  clearAllOfflineData,
  type OfflineExpense,
  type OfflinePayment
} from '@/services/offlineStorage';
import { Trash2, AlertCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';

export default function OfflineData() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<OfflineExpense[]>([]);
  const [payments, setPayments] = useState<OfflinePayment[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getOfflineStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [exp, pay, sts] = await Promise.all([
        getOfflineExpenses(),
        getOfflinePayments(),
        getOfflineStats()
      ]);
      setExpenses(exp);
      setPayments(pay);
      setStats(sts);
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os dados offline",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense(id: string) {
    if (confirm('Remover este lançamento offline?')) {
      try {
        await removeOfflineExpense(id);
        toast({
          title: "✅ Removido",
          description: "Lançamento offline removido"
        });
        loadData();
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Não foi possível remover o lançamento",
          variant: "destructive"
        });
      }
    }
  }

  async function handleDeletePayment(id: string) {
    if (confirm('Remover este pagamento offline?')) {
      try {
        await removeOfflinePayment(id);
        toast({
          title: "✅ Removido",
          description: "Pagamento offline removido"
        });
        loadData();
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Não foi possível remover o pagamento",
          variant: "destructive"
        });
      }
    }
  }

  async function handleClearAll() {
    if (confirm('⚠️ ATENÇÃO: Isso irá remover TODOS os dados offline, incluindo dados não sincronizados. Tem certeza?')) {
      try {
        await clearAllOfflineData();
        toast({
          title: "✅ Dados limpos",
          description: "Todos os dados offline foram removidos"
        });
        loadData();
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Não foi possível limpar os dados",
          variant: "destructive"
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalItems = expenses.length + payments.length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dados Offline</h1>
        <p className="text-gray-600 mt-2">
          Gerencie os dados salvos localmente para sincronização posterior
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalItems}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.expenses.pending + stats.payments.pending}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sincronizados</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.expenses.synced + stats.payments.synced}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Botão de limpar tudo */}
      {totalItems > 0 && (
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todos os Dados
          </Button>
        </div>
      )}

      {/* Lançamentos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Lançamentos ({expenses.length})
          </h2>
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum lançamento offline</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className={`
                  bg-white rounded-lg shadow p-4 border-l-4 transition-all hover:shadow-md
                  ${expense.synced 
                    ? 'border-green-500' 
                    : expense.error 
                    ? 'border-red-500' 
                    : 'border-orange-500'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Comanda #{expense.tabId}
                      </span>
                      {expense.synced ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                          Sincronizado
                        </span>
                      ) : expense.error ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                          Erro
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                          Pendente
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Item:</span> #{expense.itemId}
                      </p>
                      <p>
                        <span className="font-medium">Quantidade:</span> {expense.quantity}
                      </p>
                      {expense.notes && (
                        <p>
                          <span className="font-medium">Observações:</span> {expense.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(expense.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {expense.error && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                          <strong>Erro:</strong> {expense.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {expense.synced ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : expense.error ? (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    )}
                    
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pagamentos */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamentos ({payments.length})
        </h2>

        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum pagamento offline</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`
                  bg-white rounded-lg shadow p-4 border-l-4 transition-all hover:shadow-md
                  ${payment.synced 
                    ? 'border-green-500' 
                    : payment.error 
                    ? 'border-red-500' 
                    : 'border-orange-500'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Comanda #{payment.tabId}
                      </span>
                      {payment.synced ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                          Sincronizado
                        </span>
                      ) : payment.error ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                          Erro
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                          Pendente
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Valor:</span>{' '}
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Método:</span> {payment.paymentMethod}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.timestamp).toLocaleString('pt-BR')}
                      </p>
                      {payment.error && (
                        <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                          <strong>Erro:</strong> {payment.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {payment.synced ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : payment.error ? (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    )}
                    
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

