import { useState, useEffect } from 'react';
import { ChartBarIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { tabsApi, expensesApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { formatCurrency } from '../utils/formatters';
import AddExpenseModal from '../components/AddExpenseModal';

interface ConsumptionItem {
  id: string;
  name: string;
  quantity: number;
  totalValue: number;
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  year: number;
  month: number;
  created_at: string;
}

interface ConsumptionReport {
  year: number;
  month: number;
  items: ConsumptionItem[];
  expenses: Expense[];
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ConsumptionReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const { toast } = useToast();

  // Inicializar com o mês atual
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Carregar relatório quando o mês mudar
  useEffect(() => {
    if (selectedMonth) {
      loadReport();
    }
  }, [selectedMonth]);

  const loadReport = async () => {
    if (!selectedMonth) return;

    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const data = await tabsApi.getConsumptionReport(year, month);
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar relatório. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gerar opções de meses (últimos 12 meses + 6 meses futuros)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    // Últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    // Próximos 6 meses
    for (let i = 1; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  const handleAddExpense = async (description: string, amount: string) => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    
    try {
      await expensesApi.create({
        description,
        amount,
        year,
        month,
      });
      
      toast({
        variant: "default",
        title: "Sucesso",
        description: "Despesa adicionada com sucesso!",
      });
      
      // Recarregar relatório
      await loadReport();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      await expensesApi.delete(expenseId);
      
      toast({
        variant: "default",
        title: "Sucesso",
        description: "Despesa excluída com sucesso!",
      });
      
      // Recarregar relatório
      await loadReport();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir despesa. Tente novamente.",
      });
    }
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Relatório de Consumo</h1>
            </div>

            {/* Filtro de Mês */}
            <div className="w-full md:w-64">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-12 px-4 py-3 text-lg rounded-2xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione um mês</option>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Adicionar Despesa */}
          {selectedMonth && (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowExpenseModal(true)}
                className="gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Adicionar Despesa
              </Button>
            </div>
          )}
        </div>

        {/* Relatório */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !report ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Selecione um mês para visualizar o relatório
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cards de Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Faturado */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Total Faturado</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(report.totalRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Gasto */}
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm text-red-700 mb-1">Total Gasto</p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(report.totalExpenses)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Lucro */}
              <Card className={`${report.profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                <CardContent className="pt-6">
                  <div>
                    <p className={`text-sm mb-1 ${report.profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      {report.profit >= 0 ? 'Lucro' : 'Prejuízo'}
                    </p>
                    <p className={`text-2xl font-bold ${report.profit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                      {formatCurrency(Math.abs(report.profit))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Itens e Despesas */}
            <Card>
              <CardHeader>
                <CardTitle>Itens Consumidos e Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                        <th className="text-left py-3 px-4 font-semibold">Descrição</th>
                        <th className="text-right py-3 px-4 font-semibold">Quantidade</th>
                        <th className="text-right py-3 px-4 font-semibold">Valor</th>
                        <th className="text-right py-3 px-4 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Itens Consumidos */}
                      {report.items.map((item, index) => (
                        <tr key={`item-${item.id}`} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-green-700">
                            + {formatCurrency(item.totalValue)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            -
                          </td>
                        </tr>
                      ))}

                      {/* Despesas */}
                      {report.expenses.map((expense) => (
                        <tr key={`expense-${expense.id}`} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                              Despesa
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{expense.description}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">-</td>
                          <td className="py-3 px-4 text-right font-semibold text-red-700">
                            - {formatCurrency(parseFloat(expense.amount))}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Mensagem se não houver dados */}
                      {report.items.length === 0 && report.expenses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            Nenhum item consumido ou despesa registrada neste período
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Adicionar Despesa */}
        {selectedMonth && (
          <AddExpenseModal
            isOpen={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            onConfirm={handleAddExpense}
            year={parseInt(selectedMonth.split('-')[0])}
            month={parseInt(selectedMonth.split('-')[1])}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;

